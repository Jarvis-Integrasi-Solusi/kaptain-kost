// resources/js/components/app-logo.tsx
import logoImage from '../../../public/images/logo.png';

export default function AppLogo({ className = '' }: { className?: string }) {
    return <img src={logoImage} alt="Logo" className={`h-8 w-8 ${className} object-contain p-0.5`} />;
}
