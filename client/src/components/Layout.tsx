import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-background min-h-screen">
      {/* Content area com padding apropriado para a navbar lateral */}
      <div 
        className="layout-content layout-fade-in"
        style={{
          marginLeft: '60px', // Espaço para navbar fechada em desktop
          minHeight: '100vh',
          paddingTop: '48px' // Espaço para o header da navbar
        }}
      >
        <div className="layout-container px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;