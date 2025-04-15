import { useState } from "react"
import axios from "axios"
import { FcGoogle } from "react-icons/fc"
import { Link, useNavigate } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google"
import airplaneImg from "./assets/airplane.jpg"


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

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    axios.post("http://localhost:3001/signup", {
      name,
      email,
      password,
      confirmPassword,
    })
    .then(result => {
      console.log(result)
      navigate("/")
    })
    .catch(error => {
      console.error(error)
      alert(error.response?.data?.message || "Signup failed")
    })
  }

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google signup successful", tokenResponse)
      navigate("/")
    },
    onError: () => {
      console.error("Google signup failed")
      setError("Google signup failed. Please try again.")
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen font-glory">
      <div className="flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-[#1a2e44]">Get started<span>&#33;</span></h1>
          <p className="text-sm text-gray-600 mb-6">Create your account below to get started</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Enter your name" className="mt-1" onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="mb-4">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="Enter your email" className="mt-1" onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" className="mt-1" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="mb-4">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm your password" className="mt-1" onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full mb-4 bg-blue-600 text-white hover:bg-blue-700">Sign Up</Button>
          </form>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <Button onClick={() => googleLogin()} className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100">
            <FcGoogle className="text-lg" />
            Sign up with Google
          </Button>

          <p className="text-xs text-center mt-4">
            Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>

      <div className="h-full w-full">
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
  )
}
