import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function Router({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
}

interface RouteProps {
  path: string;
  element: ReactNode;
}

export function Route({ path, element }: RouteProps) {
  const routerContext = useRouter();
  const currentPath = routerContext.currentPath;

  if (path === currentPath) {
    return <>{element}</>;
  }

  const paramNames = [...path.matchAll(/:([^/]+)/g)].map(m => m[1]);
  if (paramNames.length === 0) {
    return null;
  }

  const pathPattern = path.replace(/:[^/]+/g, '([^/]+)');
  const regex = new RegExp(`^${pathPattern}$`);
  const match = currentPath.match(regex);

  if (match) {
    const extractedParams: Record<string, string> = { ...routerContext.params };
    paramNames.forEach((name, index) => {
      extractedParams[name] = match[index + 1];
    });

    return (
      <RouterContext.Provider value={{ ...routerContext, params: extractedParams }}>
        {element}
      </RouterContext.Provider>
    );
  }

  return null;
}

export function Routes({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
