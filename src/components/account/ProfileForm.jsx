import React, {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import InputField from '@/components/ui/InputField';
import BlackButton from '@/components/ui/BlackButton';

export default function ProfileForm({initial, onSaved}){
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    avatar: null,
    avatar_url: null,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(()=>{
    if(!initial) return;
    // Safely extract known fields from initial payload. initial might be the user or { user }
    const src = initial.avatar_url || (initial.user && initial.user.avatar_url) || (initial.user && initial.user.avatar) || initial.avatar || null;
    const first_name = initial.first_name || (initial.user && initial.user.first_name) || (initial.client && initial.client.first_name) || '';
    const last_name = initial.last_name || (initial.user && initial.user.last_name) || (initial.client && initial.client.last_name) || '';
    const phone = initial.phone || (initial.user && initial.user.phone) || (initial.client && initial.client.phone) || '';
    setForm(f=>({...f, first_name, last_name, phone, avatar_url: src}));
  }, [initial]);

  // cleanup object URL when component unmounts or when a new file is selected
  useEffect(()=>{
    return () => {
      if(form && form.avatar_url && form.avatar instanceof File){
        try{ URL.revokeObjectURL(form.avatar_url); }catch(e){ }
      }
    };
  }, []);

  function handleChange(e){
    const {name, value, files} = e.target;
    if(name === 'avatar'){
      const file = files[0];
      if(file){
        if(file.size > 2 * 1024 * 1024){
          setErrors(prev=>({...prev, avatar: 'File must be 2MB or smaller'}));
          return;
        }
        setForm(f=>({...f, avatar: file, avatar_url: URL.createObjectURL(file)}));
      } else {
        setForm(f=>({...f, avatar: null}));
      }
    } else {
      setForm(f=>({...f, [name]: value}));
    }
    setErrors(prev => ({...prev, [name]: null}));
  }

  async function submit(e){
    e.preventDefault();
    setSaving(true);
    setServerError('');
    setErrors({});
    // client-side validation
    const newErrors = {};
    if(!form.first_name || form.first_name.trim().length < 2) newErrors.first_name = 'First name must be at least 2 characters';
    if(!form.last_name || form.last_name.trim().length < 2) newErrors.last_name = 'Last name must be at least 2 characters';
    if(form.phone && !/^\+?[0-9\s\-()]{6,20}$/.test(form.phone)) newErrors.phone = 'Enter a valid phone number';
    if(Object.keys(newErrors).length){ setErrors(newErrors); setSaving(false); return; }
    const fd = new FormData();
    fd.append('first_name', form.first_name||'');
    fd.append('last_name', form.last_name||'');
    fd.append('phone', form.phone||'');
    if(form.avatar) fd.append('avatar', form.avatar);

    try{
      const res = await fetch('/api/account/profile', { method: 'POST', body: fd, credentials: 'include' });
      if(!res.ok){
        // try to parse validation errors
        if(res.status === 422){
          const body = await res.json().catch(()=>null);
          if(body && body.errors){ setErrors(body.errors); setSaving(false); return; }
        }
        throw new Error('Save failed');
      }
      const body = await res.json().catch(()=>null);
      // backend may return either the user object or { user }
      const data = body && body.user ? body.user : body || null;
      if(data){
        // update local form fields to match /api/auth/me shape
        const avatar_url = data.avatar_url || (data.user && data.user.avatar_url) || data.avatar || null;
        const first_name = data.first_name || (data.client && data.client.first_name) || '';
        const last_name = data.last_name || (data.client && data.client.last_name) || '';
        const phone = data.phone || (data.client && data.client.phone) || '';
        setForm(f=>({...f, first_name, last_name, phone, avatar_url, avatar: null}));
      }
      onSaved && onSaved(data || body);
      // update redux auth user while preserving token
      try{ dispatch(loginSuccess({ user: data || body, token })); }catch(e){ /* non-fatal */ }

    }catch(err){
      console.error(err);
      setServerError('Failed to save profile. Please try again.');
    }finally{ setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium">Profile Picture</label>
        <div className="flex items-center space-x-4 mb-2">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-400">No image</div>
          )}
          <div>
            <label htmlFor="avatar-input" className="inline-flex items-center px-3 py-2 bg-white border rounded-md text-sm cursor-pointer hover:bg-gray-50">
              {form.avatar_url?<span className="mr-2">Change image</span>:<span>Choose image</span>}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m0-9V3m0 9l3-3m-3 3-3-3" />
              </svg>
            </label>
            <input id="avatar-input" name="avatar" type="file" accept="image/*" onChange={handleChange} className="sr-only" />
          </div>
        </div>
        {errors.avatar && <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>}
      </div>
      <InputField label="First name" name="first_name" value={form.first_name} onChange={handleChange} />
      {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
      <InputField label="Last name" name="last_name" value={form.last_name} onChange={handleChange} />
      {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
      <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
      {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <div>
        <BlackButton type="submit" disabled={saving}>{saving? 'Saving...' : 'Save profile'}</BlackButton>
      </div>
    </form>
  );
}
