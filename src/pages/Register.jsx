import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import BusinessProfileFields from '@/components/BusinessProfileFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/client';
import { emptyProfile, profilePayload } from '@/lib/profile';

export default function Register() {
  const [params] = useSearchParams();
  const inviteToken = params.get('invite');
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [profile, setProfile] = useState(() => ({ ...emptyProfile(), email: params.get('email') || '' }));
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async event => {
    event.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    setBusy(true); setError('');
    try {
      await api.auth.register({ email, password, inviteToken, profile: profilePayload({ ...profile, logo_url: '' }) });
      if (logoFile) {
        const uploaded = await api.uploadFile({ file: logoFile });
        await api.auth.updateProfile(profilePayload({ ...profile, logo_url: uploaded.file_url }));
      }
      window.location.assign('/');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <AuthLayout wide icon={UserPlus} title={inviteToken ? 'Create your account' : 'Invitation required'}
    subtitle={inviteToken ? 'Add your business details so estimates and invoices fill in automatically.' : 'Contact the app owner to request an invitation.'}
    footer={<Link className="text-primary hover:underline" to="/login">Back to log in</Link>}>
    {inviteToken && <form className="space-y-4" onSubmit={submit}>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div><Label htmlFor="email">Account email *</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><Label htmlFor="password">Password (at least 12 characters) *</Label><Input id="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <div><Label htmlFor="confirm">Confirm password *</Label><Input id="confirm" type="password" required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
      <div className="border-t border-slate-200 pt-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Business details</h2>
        <BusinessProfileFields form={profile} setForm={setProfile} logoFile={logoFile} onLogoFile={setLogoFile} disabled={busy} />
      </div>
      <Button className="w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
    </form>}
  </AuthLayout>;
}
