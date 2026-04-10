import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUser, setLoading } from "../redux/authSlice";
import { ADMIN_API_END_POINT } from "../utils/constant";

const useGetAdmin = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        // Only run if we are in admin routes AND user is not already set
        if (!location.pathname.startsWith('/admin')) {
            // If we are not on admin path and no other hook is active, we might need to set loading to false
            // But we'll let useGetCompany handle it if it's a recruiter path.
            return;
        }

        if (user) {
            dispatch(setLoading(false));
            return;
        }

        const fetchAdmin = async () => {
            dispatch(setLoading(true));
            try {
                const res = await axios.get(`${ADMIN_API_END_POINT}/me`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    dispatch(setUser(res.data.admin));
                }
            } catch (error) {
                console.log("Admin session not found");
            } finally {
                dispatch(setLoading(false));
            }
        };
        fetchAdmin();
    }, [dispatch, location.pathname, user]); // Include user to prevent loops
};

export default useGetAdmin;
