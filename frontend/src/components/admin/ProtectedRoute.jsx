import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirection logic only runs if loading is false
        if (!loading && (!user || user.role !== 'super_admin')) {
            navigate("/admin/login");
        }
    }, [user, loading, navigate]);

    // Show a clean loading state or nothing while checking session
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {user && user.role === 'super_admin' ? children : null}
        </>
    )
};

export default ProtectedRoute;
