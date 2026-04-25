'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { X, MapPin } from 'lucide-react';
import { extractLocationFromPlace } from '@/lib/locationHelper';

/**
 * Custom LocationSearch component with Google Places API
 * Full control over UI - no web component
 */
export default function LocationSearch({
  value = '',
  onChange = null,
  placeholder = 'Enter postcode or area',
  className = '',
  onLocationChange = null,
  onLocationFocus = null,
  onLocationBlur = null,
}) {
  const [displayText, setDisplayText] = useState(value);
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const loaderRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  // Set client flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync value prop changes to displayText
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayText(value);
    }
  }, [value]);

  // Initialize Google Places API
  useEffect(() => {
    async function initPlaces() {
      try {
        if (!loaderRef.current) {
          loaderRef.current = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
            version: 'weekly',
            libraries: ['places'],
            loading: 'async',
          });
        }

        await loaderRef.current.load();
        console.log('Google Maps API loaded');

        // Initialize services
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
          placesServiceRef.current = new google.maps.places.PlacesService(
            document.createElement('div')
          );
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          console.log('Places services initialized');
        }
      } catch (error) {
        console.error('Failed to initialize Google Places:', error);
      }
    }

    initPlaces();
  }, []);

  // Handle input change with autocomplete
  const handleInputChange = async (e) => {
    const text = e.target.value;
    setDisplayText(text);

    if (onChange) onChange(text);

    if (text.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (!autocompleteServiceRef.current) {
      console.warn('Autocomplete service not ready');
      return;
    }

    try {
      setIsLoading(true);
      const predictions = await autocompleteServiceRef.current.getPlacePredictions({
        input: text,
        sessionToken: sessionTokenRef.current,
      });

      if (predictions.predictions) {
        setSuggestions(predictions.predictions);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching autocomplete predictions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = async (prediction) => {
    console.log('Suggestion clicked:', prediction);
    
    if (!placesServiceRef.current) {
      console.warn('Places service not ready');
      return;
    }

    try {
      setIsLoading(true);

      // Get detailed place information
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          sessionToken: sessionTokenRef.current,
          fields: [
            'formatted_address',
            'geometry',
            'address_components',
            'place_id',
          ],
        },
        async (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            console.log('Place details:', place);

            const locationData = {
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng(),
              address: place.formatted_address,
              placeId: place.place_id,
            };

            // Extract postcode and country if available
            if (place.address_components) {
              place.address_components.forEach(component => {
                if (component.types.includes('postal_code')) {
                  locationData.postcode = component.long_name;
                }
                if (component.types.includes('country')) {
                  locationData.country = component.long_name;
                }
              });
            }

            console.log('Location data:', locationData);
            setDisplayText(place.formatted_address);
            setSuggestions([]);
            setShowDropdown(false);

            // Notify parent
            if (onLocationChange) {
              onLocationChange(locationData);
            }

            // Create new session token for next search
            sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          } else {
            console.error('Failed to get place details:', status);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error selecting place:', error);
      setIsLoading(false);
    }
  };

  // Handle focus
  const handleFocus = () => {
    console.log('Location search focused');
    setShowDropdown(true);
    if (onLocationFocus) {
      onLocationFocus();
    }
  };

  // Handle blur
  const handleBlur = () => {
    console.log('Location search blurred');
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    if (onLocationBlur) {
      onLocationBlur();
    }
  };

  // Handle current location
  const handleCurrentLocation = () => {
    console.log('Getting current location...');
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Current location:', { latitude, longitude });

        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
          
          if (result.results && result.results.length > 0) {
            const address = result.results[0].formatted_address;
            console.log('Address:', address);
            setDisplayText(address);
            setSuggestions([]);
            setShowDropdown(false);

            // Notify parent
            if (onLocationChange) {
              onLocationChange({
                lat: latitude,
                lon: longitude,
                address: address,
                isCurrentLocation: true,
              });
            }
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          alert('Failed to get address from coordinates');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location';
        
        if (error.code === 1) {
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === 2) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        
        console.error('Geolocation error details:', errorMessage);
        alert(errorMessage);
      }
    );
  };

  // Handle clear button
  const handleClear = () => {
    setDisplayText('');
    setSuggestions([]);
    setShowDropdown(false);
    if (onChange) onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} suppressHydrationWarning>
      <div className="flex gap-1 sm:gap-2 items-center px-3 sm:px-4 py-2 overflow-visible" suppressHydrationWarning>
        {/* Location Icon */}
        <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 pointer-events-none flex-shrink-0" />

        {/* Custom Input - uses fixed positioning for dropdown */}
        <div className="w-full relative z-50">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={displayText}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full h-8 sm:h-9 border-0 bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:outline-none"
          />

          {/* Dropdown with suggestions */}
          {showDropdown && isClient && (
            <div className="absolute top-full mt-1 w-[calc(100%+50px)] bg-white border border-gray-200 rounded-md shadow-md z-[99999] overflow-hidden">
              {/* Current Location Option */}
              <button
                type="button"
                onClick={handleCurrentLocation}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-100"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Current Location</span>
              </button>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-b border-gray-100 last:border-b-0"
                      disabled={isLoading}
                    >
                      <div className="text-gray-900">
                        {suggestion.description}
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Loading state */}
              {isLoading && suggestions.length === 0 && (
                <div className="px-3 py-2.5 text-sm text-gray-500">
                  Loading suggestions...
                </div>
              )}

              {/* No results */}
              {!isLoading && displayText.length > 0 && suggestions.length === 0 && (
                <div className="px-3 py-2.5 text-sm text-gray-500">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear Button - Only render on client to avoid hydration mismatch */}
        {isClient && displayText && (
          <button
            type="button"
            onClick={handleClear}
            className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 hover:text-gray-600 flex items-center justify-center flex-shrink-0"
            title="Clear location"
            aria-label="Clear location"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
