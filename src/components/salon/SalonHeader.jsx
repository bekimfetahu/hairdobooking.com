"use client";

import { Bookmark, Heart, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { loginSuccess } from "@/store/slices/authSlice";
import { likeSalon, unlikeSalon } from "@/services/auth/likedSalons";
import { setPrimarySalon } from "@/services/auth/primarySalon";
import { saveSalon, unsaveSalon } from "@/services/auth/savedSalons";
import { cn } from "@/lib/utils";

export default function SalonHeader({ salon }) {
  const venueName = salon?.venue?.name || "Salon";
  const venueAddress = salon?.venue?.address?.formatted || "";
  const venueUuid = salon?.venue?.uuid || null;
  const venueSlug = salon?.venue?.slug || null;
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = !!user;
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isSaveSubmitting, setIsSaveSubmitting] = useState(false);
  const [isPrimarySubmitting, setIsPrimarySubmitting] = useState(false);

  const primaryVenue = user?.client?.primary_venue ?? user?.client?.primaryVenue ?? null;
  const likedVenues = user?.client?.liked_venues ?? user?.client?.likedVenues ?? [];
  const savedVenues = user?.client?.saved_venues ?? user?.client?.savedVenues ?? [];

  const isPreferred = primaryVenue?.uuid === venueUuid;

  const isLiked = useMemo(() => {
    return Array.isArray(likedVenues) && likedVenues.some((venue) => venue?.uuid === venueUuid);
  }, [likedVenues, venueUuid]);

  const isSaved = useMemo(() => {
    return Array.isArray(savedVenues) && savedVenues.some((venue) => venue?.uuid === venueUuid);
  }, [savedVenues, venueUuid]);

  const ensureAuthenticated = () => {
    if (isAuthenticated) {
      return true;
    }

    const redirectTarget = pathname || (venueSlug ? `/salon/${venueSlug}` : '/');
    router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    return false;
  };

  const handleLikeToggle = async () => {
    if (!venueUuid || !ensureAuthenticated()) {
      return;
    }

    setIsLikeSubmitting(true);

    try {
      const updatedUser = isLiked ? await unlikeSalon(venueUuid) : await likeSalon(venueUuid);
      dispatch(loginSuccess({ user: updatedUser }));
    } catch (error) {
      console.error('Failed to update liked salon state:', error);
    } finally {
      setIsLikeSubmitting(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!venueUuid || !ensureAuthenticated()) {
      return;
    }

    setIsSaveSubmitting(true);

    try {
      const updatedUser = isSaved ? await unsaveSalon(venueUuid) : await saveSalon(venueUuid);
      dispatch(loginSuccess({ user: updatedUser }));
    } catch (error) {
      console.error('Failed to update saved salon state:', error);
    } finally {
      setIsSaveSubmitting(false);
    }
  };

  const handlePreferredToggle = async () => {
    if (!venueUuid || !ensureAuthenticated() || isPreferred) {
      return;
    }

    setIsPrimarySubmitting(true);

    try {
      const updatedUser = await setPrimarySalon(venueUuid);
      dispatch(loginSuccess({ user: updatedUser }));
    } catch (error) {
      console.error('Failed to update preferred salon state:', error);
    } finally {
      setIsPrimarySubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 items-start lg:items-end lg:grid-cols-[1fr_auto]">
      {/* Left column: Salon info - always visible */}
      <div className="flex flex-col gap-2 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Your salon
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
          {venueName}
        </h1>
        {venueAddress && (
          <p className="text-base leading-8 text-neutral-600 md:text-lg">
            {venueAddress}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
        <button
          type="button"
          onClick={handlePreferredToggle}
          disabled={!venueUuid || isPrimarySubmitting || isPreferred}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            isPreferred
              ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-primary hover:text-primary",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
          aria-pressed={isPreferred}
          aria-label={isPreferred ? "This is your preferred salon" : "Set as preferred salon"}
        >
          <Star className={cn("h-4 w-4", isPreferred && "fill-current")} />
          <span>{isPreferred ? "Preferred salon" : "Set preferred"}</span>
        </button>

        <button
          type="button"
          onClick={handleLikeToggle}
          disabled={!venueUuid || isLikeSubmitting}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            isLiked
              ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-primary hover:text-primary",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Remove like from salon" : "Like salon"}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          type="button"
          onClick={handleSaveToggle}
          disabled={!venueUuid || isSaveSubmitting}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            isSaved
              ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-primary hover:text-primary",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remove salon from saved salons" : "Save salon"}
        >
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
