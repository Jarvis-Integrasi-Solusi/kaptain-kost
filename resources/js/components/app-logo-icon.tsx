// resources/js/components/app-logo.tsx
import logoImage from '../../../public/images/logo.png';

export default function AppLogo({ className = '' }: { className?: string }) {
    return <img src={logoImage} alt="Logo" className={`${className} object-contain `} />;
}
