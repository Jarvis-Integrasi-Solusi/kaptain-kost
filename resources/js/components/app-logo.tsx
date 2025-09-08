import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-white text-sidebar-primary-foreground">
                <AppLogoIcon className="size-8 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Kaptain Kost</span>
            </div>
        </>
    );
}
