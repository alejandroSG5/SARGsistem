import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AnatomyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Anatomy 3D Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#060608] text-white p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black mb-2">Error al Cargar Modelo 3D</h2>
            <p className="text-gray-400 max-w-md mb-8 text-sm">
                No se pudo cargar el archivo "planos_anatomicos.glb". Esto puede deberse a que el archivo no está en el directorio correcto o a un error de red.
            </p>
            <button 
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
                <RefreshCw size={18} /> Reintentar
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}
