import { useRouter } from '../components/Router';
import LocalAuthForm from '../components/LocalAuthForm';

export default function LocalAuth() {
  const { navigate } = useRouter();
  const close = () => navigate('/access');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={close}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <LocalAuthForm onClose={close} />
      </div>
    </div>
  );
}
