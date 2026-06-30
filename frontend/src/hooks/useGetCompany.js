import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUser, setLoading } from "../redux/authSlice";

const useGetCompany = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        // Only run if we are in recruiter routes
        if (!location.pathname.startsWith('/recruiter')) return;

        if (user) {
            dispatch(setLoading(false));
            return;
        }

        const fetchCompany = async () => {
            dispatch(setLoading(true));
            try {
                const res = await axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/company/me", {
                    withCredentials: true
                });
                if (res.data.success) {
                    dispatch(setUser(res.data.company));
                }
            } catch (error) {
                console.log("Recruiter session not found");
            } finally {
                dispatch(setLoading(false));
            }
        };
        fetchCompany();
    }, [dispatch, location.pathname, user]); // Include user to prevent loops
};

export default useGetCompany;
