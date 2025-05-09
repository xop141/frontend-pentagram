'use client'

import React, { useState } from 'react'
import { useFormik } from 'formik'
import FbLogin from '../login/loginComponent/fbLogin'
import SeparatorOr from '../login/loginComponent/SeparatorOr'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Jump from '../login/loginComponent/jump'
import signSchema from './signComponent/signSchema'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import MailVerify from './signComponent/mailVerify'
import { API } from '@/utils/api'

import * as Dialog from '@radix-ui/react-dialog';
const Page = () => {
  const [resp, setResp] = useState('')
  const [loading, setLoading] = useState(false)
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      username: '',
      fullname: '',
    },
    validationSchema: signSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const res = await axios.post(API + '/api/auth/register', values)
        const notify = () => toast(res.data.message)
        setResp(res.data.message)
        notify()
      } catch (error) {
        console.error(error)
        toast.error('Something went wrong!')
      } finally {
        setLoading(false)
      }
    },
  })
  const isDialogVisible = !!resp && resp.includes('Verification code sent to email')
  return (
    <div className="w-full h-[100vh] flex relative">

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-black h-full w-full flex items-center justify-center flex-col gap-[10px]">
        <div className="border border-white/50 w-full max-w-[350px] flex flex-col items-center gap-[10px] px-[30px] py-14 rounded-xl">
       

          <p className="text-center text-white">
            Sign up to see photos and videos <br /> from your friends
          </p>

          <FbLogin />
          <SeparatorOr />
          <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-[15px] text-white">
            <div className="relative">
              <Input
                placeholder="Mobile number or email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              {formik.errors.email && formik.touched.email && (
                <div className="text-red-500">{formik.errors.email}</div>
              )}
            </div>

            <Input
              placeholder="Password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />
            {formik.errors.password && formik.touched.password && (
              <div className="text-red-500">{formik.errors.password}</div>
            )}
          

            <Input
              placeholder="Full name"
              name="fullname"
              onChange={formik.handleChange}
              value={formik.values.fullname}
            />
            {formik.errors.fullname && formik.touched.fullname && (
              <div className="text-red-500">{formik.errors.fullname}</div>
            )}

            <Input
              placeholder="Username"
              name="username"
              onChange={formik.handleChange}
              value={formik.values.username}
            />
            {formik.errors.username && formik.touched.username && (
              <div className="text-red-500">{formik.errors.username}</div>
            )}

            <ToastContainer theme="dark" position="top-center" />

            <div className="text-center text-[12px] flex flex-col gap-[10px] text-white/50">
              <p>
                People who use our service may have uploaded your contact information to Pentagram.{' '}
                <span className="text-blue-100 cursor-pointer hover:underline">Learn more</span>.
              </p>
              <p>
                By signing up, you agree to our{' '}
                <span className="text-blue-100 cursor-pointer hover:underline">Terms</span>,{' '}
                <span className="text-blue-100 cursor-pointer hover:underline">Privacy Policy</span> and{' '}
                <span className="text-blue-100 cursor-pointer hover:underline">Cookie Policy</span>.
              </p>
            </div>
            <Button
              type="submit"
              className="bg-blue-500 w-full"
              disabled={formik.isSubmitting || loading}
            >
              Sign up
            </Button>
          </form>
        </div>
        <Jump pageName="login" />
      </div>
      <Dialog.Root open={isDialogVisible} onOpenChange={() => setResp('')}>
        <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/50 p-6 rounded-lg">
          <Dialog.DialogTitle/>
      
            <MailVerify email={formik.values.email} closeDialog={() => setResp('')} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
export default Page