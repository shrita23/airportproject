import { useState } from "react"
import axios from "axios"
import { FcGoogle } from "react-icons/fc"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import airplaneImg from "./assets/airplane.jpg"
import { useGoogleLogin } from "@react-oauth/google";


export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  )
}

export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:3001/login", {
      email,
      password
    })
    .then(result => {
      console.log(result);
      if (result.data.message === "Login successful"){
        navigate("/landing");
      } else {
        alert("Invalid email or password");
      }      
    })
    .catch(err => {
      console.error(err);
      alert("Invalid email or password");
    });
  };
  
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google login successful', tokenResponse);
      navigate('/landing');
    },
    onError: () => {
      console.error('Google login failed');
    }
  });
  
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen font-glory">
      <div className="flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-[#1a2e44] dark:text-sky-400">Welcome back<span>&#33;</span></h1>
          <p className="text-sm text-gray-600 mb-6 dark:text-sky-700">Enter your Credentials to access your account</p>

          <div className="mb-4">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="Enter your email" className="mt-1" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              {/* <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a> */}
            </div>
            <Input id="password" type="password" placeholder="Enter your password" className="mt-1" onChange={(e) => setPassword(e.target.value)}/>
          </div>

          <Button onClick={handleSubmit} className="w-full mb-4 bg-blue-600 text-white hover:bg-blue-700">Login</Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#252425] px-2 text-gray-500 dark:text-gray-100">or</span>
            </div>
          </div>

          <Button onClick={() => googleLogin()} className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100">
            <FcGoogle className="text-lg" />
            Sign in with Google
          </Button>

          <p className="text-xs text-center mt-4">
  Don&apos;t have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
</p>

        </div>
      </div>
      <div className="h-full w-full">
        {/* Responsive image styling */}
        <img
  src={airplaneImg}
  alt="Airplane"
  className="
    object-cover 
    w-3/4 
    h-auto
    rounded-2xl 
    mx-auto 
    mt-4

    lg:w-full 
    lg:h-full
    lg:rounded-none 
    lg:rounded-bl-3xl 
    lg:rounded-tl-3xl 
    lg:mx-0 
    lg:mt-0
  "
/>
      </div>
    </div>
  );
}
