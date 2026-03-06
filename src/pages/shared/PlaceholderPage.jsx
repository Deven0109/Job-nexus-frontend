const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                🚀
            </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 font-medium max-w-sm">
            This module is currently under development to provide you with the best recruitment experience.
        </p>
    </div>
);

export default PlaceholderPage;
