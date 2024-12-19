import { useState, useEffect } from "react";
import { useAuth } from "../../lib/context/AuthContext";

const Login = ({ onSuccessfulLogin }) => {
    const { user, login, loginWithEmail, signUpWithEmail, logout } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If user logged in successfully, call the callback
        if (user && onSuccessfulLogin) {
            onSuccessfulLogin();
        }
    }, [user, onSuccessfulLogin]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError("");
            setLoading(true);
            await login();
        } catch (error) {
            setError("Failed to login with Google");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {user.photoURL && (
                        <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span>Welcome, {user.displayName || user.email}!</span>
                </div>
                <button 
                    onClick={logout}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleEmailAuth} className="mb-4 space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2 border rounded"
                    required
                />
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Login")}
                </button>
            </form>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full p-2 border border-gray-300 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
            >
                <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-4 h-4"
                />
                Continue with Google
            </button>

            <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full mt-4 text-blue-500 hover:text-blue-600"
            >
                {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
            </button>
        </div>
    );
};

export default Login;