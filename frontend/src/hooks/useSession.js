import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUser, setLoading, setConfig } from "../redux/authSlice";
import { ADMIN_API_END_POINT } from "../utils/constant";

const useSession = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchSession = async () => {
            const isAdminPath = location.pathname.startsWith('/admin');
            const isRecruiterPath = location.pathname.startsWith('/recruiter');

            if (!isAdminPath && !isRecruiterPath) {
                dispatch(setLoading(false));
                return;
            }

            dispatch(setLoading(true));
            try {
                // 🟢 Always fetch Global Config
                const configRes = await axios.get(`${ADMIN_API_END_POINT}/config`);
                if (configRes.data.success) {
                    dispatch(setConfig(configRes.data.isSupportEnabled));
                }

                let res;
                if (isAdminPath) {
                    res = await axios.get(`${ADMIN_API_END_POINT}/me`, { withCredentials: true });
                    if (res.data.success) dispatch(setUser(res.data.admin));
                } else if (isRecruiterPath) {
                    res = await axios.get("http://localhost:8000/api/v1/company/me", { withCredentials: true });
                    if (res.data.success) dispatch(setUser(res.data.company));
                }
            } catch (error) {
                console.log("No active session found for this route");
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchSession();
    }, [location.pathname, dispatch]);
};

export default useSession;
