import axios from "axios";
import React, { useEffect, useState } from "react";

function SingUp() {
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [Success, setSuccess] = useState(false);

  const [userdata, setuserdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setuserdata({ ...userdata, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${baseUrl}/auth/register`, userdata)
      .then((res) => {
        setSuccess(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    console.log(userdata);
  }, [userdata]);

  return (
    <div className="bg-gradient-to-br from-slate-950 to-slate-800 w-full h-screen  flex  items-center justify-center px-3">
      <div className="wrapper bg-[#061526] px-10 py-8 rounded-lg flex w-full max-w-[900px] max-lg:max-w-[500px] border border-slate-800">
        <div className="w-1/2 max-lg:w-full m-auto overflow-hidden">
          <p className="text-2xl font-light font-roboto mb-8 text-center">
            Sign Up to{" "}
            <span className="font-bold font-montserrat text-4xl bg-clip-text bg-gradient-to-tr from-red-400 to-sky-500 text-transparent">
              Zinoova
            </span>
          </p>
          <form className="bg-[#0c2541] py-12 flex flex-col gap-3 text-sm rounded-2xl">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name"
              className="bg-[#091c33] w-full rounded-full py-4 px-6 max-w-[300px] m-auto outline-none"
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Id"
              className="bg-[#091c33] w-full rounded-full py-4 px-6 max-w-[300px] m-auto outline-none"
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className="bg-[#091c33] w-full rounded-full py-4 px-6 max-w-[300px] m-auto outline-none"
              onChange={handleChange}
            />
            <div className="h-fit w-full flex items-center justify-center px-4 bg-[#061526]">
              <p
                className={`text-center w-full font-montserrat bg-gradient-to-r from-blue-800 to-blue-500 text-lg ${
                  Success ? "h-10" : "h-0"
                } overflow-hidden transition-all duration-500 flex items-center justify-center`}
              >
                User created successfully.
              </p>
            </div>
            <input
              type="button"
              value={"Create your account"}
              className="bg-gradient-to-r from-[#075be0] to-[#1c90ea] w-full rounded-full py-3 px-6 max-w-[300px] m-auto outline-none cursor-pointer"
              onClick={handleSubmit}
            />
          </form>
          <p className="text-center text-sm font-outfit mt-5">
            Already have an account?{" "}
            <a href="/login" className="font-medium underline text-[#1c90ea]">
              Login
            </a>
          </p>
        </div>
        <div className="w-1/2 max-lg:hidden">
          <img
            src="/assets/authvector.png"
            alt="tradevector"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default SingUp;
