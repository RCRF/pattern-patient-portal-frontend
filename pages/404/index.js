import React from 'react';

const NoAccessPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-500 to-slate-900 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-3xl font-semibold text-gray-800 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    Oops! It seems like you don't have permission to access this page. Contact your administrator for more information.
                </p>
                <button
                    onClick={() => window.location.href = '/access'}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    Go to Patient Selection
                </button>
            </div>
        </div>
    );
};

export default NoAccessPage;
