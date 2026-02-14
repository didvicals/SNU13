import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-center">
                    <div className="max-w-md bg-white p-8 rounded-xl shadow-lg border border-red-200">
                        <div className="text-4xl mb-4">😵</div>
                        <h1 className="text-2xl font-bold text-red-800 mb-2">오류가 발생했습니다</h1>
                        <p className="text-gray-600 mb-6 text-sm">
                            죄송합니다. 예상치 못한 문제가 발생했습니다.<br />
                            페이지를 새로고침 해보세요.
                        </p>
                        <div className="bg-gray-100 p-4 rounded text-left overflow-auto text-xs font-mono text-red-500 mb-6 max-h-40">
                            {this.state.error && this.state.error.toString()}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
