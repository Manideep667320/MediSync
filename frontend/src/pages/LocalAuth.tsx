import { useRouter } from '../components/Router';
import Modal from '../components/Modal';
import LocalAuthForm from '../components/LocalAuthForm';

export default function LocalAuth() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Modal
        isOpen={true}
        onClose={() => navigate('/access')}
        title="Local User Login / Registration"
        size="sm"
      >
        <LocalAuthForm onClose={() => navigate('/access')} />
      </Modal>
    </div>
  );
}
