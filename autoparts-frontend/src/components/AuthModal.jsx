import React, { useState } from 'react';
import { Api } from '../api.js';
import Button from './Button.jsx';
import Input from './Input.jsx';
import { Spinner, IconEmail, IconLock, IconUser, IconEye, IconEyeOff } from './Icons.jsx';

export default function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fpStep, setFpStep] = useState(1);
  const [fpCode, setFpCode] = useState('');
  const [fpNew, setFpNew] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  function alertMsg(type, text) { setMsg({ type, text }); }
  function clearMsg() { setMsg(null); }

  async function submitLogin() {
    try {
      setLoading(true); clearMsg();
      const data = await Api.login(email, password);
      if (data?.token) {
        onLogin(data);
        onClose();
      } else {
        alertMsg('error', data?.message || 'Đăng nhập thất bại');
      }
    } catch {
      alertMsg('error', 'Không thể đăng nhập');
    } finally { setLoading(false); }
  }

  async function submitRegister() {
    try {
      setLoading(true); clearMsg();
      const data = await Api.register(name, email, password);
      if (data?.token) {
        onLogin(data);
        onClose();
      } else {
        alertMsg('error', data?.message || 'Đăng ký thất bại');
      }
    } catch {
      alertMsg('error', 'Không thể đăng ký');
    } finally { setLoading(false); }
  }

  async function fpSendCode() {
    try {
      if (!email) return alertMsg('error', 'Vui lòng nhập email');
      setLoading(true); clearMsg();
      const r = await Api.forgot(email);
      alertMsg('success', r?.message || 'Nếu email tồn tại, mã đã được gửi.');
      setFpStep(2);
    } catch {
      alertMsg('error', 'Không thể gửi mã. Thử lại sau.');
    } finally { setLoading(false); }
  }

  async function fpVerify() {
    try {
      if (!email || !fpCode) return alertMsg('error', 'Nhập email và mã xác minh');
      setLoading(true); clearMsg();
      const r = await Api.verifyReset(email, fpCode);
      if (r?.ok) {
        setVerified(true);
        alertMsg('success', 'Mã hợp lệ. Bạn có thể đặt mật khẩu mới.');
      } else {
        setVerified(false);
        alertMsg('error', r?.message || 'Mã không đúng hoặc đã hết hạn.');
      }
    } catch {
      setVerified(false);
      alertMsg('error', 'Không thể xác minh mã.');
    } finally { setLoading(false); }
  }

  async function fpReset() {
    try {
      if (!verified) return alertMsg('error', 'Bạn cần xác minh mã trước');
      if (!fpNew || fpNew.length < 4) return alertMsg('error', 'Mật khẩu tối thiểu 4 ký tự');
      if (fpNew !== fpConfirm) return alertMsg('error', 'Xác nhận mật khẩu không khớp');
      setLoading(true); clearMsg();
      const r = await Api.reset(email, fpCode, fpNew);
      if (r?.ok && r?.token) {
        alertMsg('success', 'Đổi mật khẩu thành công. Đang đăng nhập…');
        onLogin({ token: r.token, user: r.user });
        onClose();
      } else {
        alertMsg('error', r?.message || 'Đổi mật khẩu thất bại');
      }
    } catch {
      alertMsg('error', 'Không thể đổi mật khẩu');
    } finally { setLoading(false); }
  }

  const TabBtn = ({ active, children, onClick }) => (
    <button
      className={`px-4 py-2 rounded-2xl border text-sm transition ${active ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 max-w-xl mx-auto mt-20 p-0">
        <div className="rounded-2xl border bg-white shadow-xl p-6">
          <div className="flex gap-2 mb-4">
            <TabBtn active={tab==='login'} onClick={()=>{setTab('login'); clearMsg(); setShowPassword(false);}}>Đăng nhập</TabBtn>
            <TabBtn active={tab==='register'} onClick={()=>{setTab('register'); clearMsg(); setShowPassword(false);}}>Đăng ký</TabBtn>
            <TabBtn active={tab==='forgot'} onClick={()=>{setTab('forgot'); setFpStep(1); setVerified(false); clearMsg(); setShowPassword(false);}}>Quên mật khẩu</TabBtn>
          </div>

          {msg && (
            <div className={`mb-3 text-sm rounded-xl px-3 py-2 border ${msg.type==='success' ? 'bg-green-50 border-green-200 text-green-700' : msg.type==='error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              {msg.text}
            </div>
          )}

          {tab === 'login' && (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IconEmail /></span>
                <Input className="w-full !pl-10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IconLock /></span>
                <Input type={showPassword ? 'text' : 'password'} className="w-full !pl-10" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <Button className="w-full h-11 flex items-center justify-center" onClick={submitLogin} disabled={loading}>
                {loading ? <Spinner /> : 'Đăng nhập'}
              </Button>
            </div>
          )}

          {tab === 'register' && (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IconUser /></span>
                <Input className="w-full !pl-10" placeholder="Họ tên" value={name} onChange={e=>setName(e.target.value)} disabled={loading} />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IconEmail /></span>
                <Input className="w-full !pl-10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IconLock /></span>
                <Input type={showPassword ? 'text' : 'password'} className="w-full !pl-10" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} disabled={loading} />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <Button className="w-full h-11 flex items-center justify-center" onClick={submitRegister} disabled={loading}>
                {loading ? <Spinner /> : 'Tạo tài khoản'}
              </Button>
            </div>
          )}

          {tab === 'forgot' && (
            <div className="space-y-4">
              {fpStep === 1 && (
                <>
                  <div className="text-sm text-gray-600">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</div>
                  <Input className="w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                  <Button className="w-full h-11 flex items-center justify-center" onClick={fpSendCode} disabled={loading}>
                    {loading ? <Spinner /> : 'Gửi mã'}
                  </Button>
                </>
              )}
              {fpStep === 2 && (
                <>
                  <div className="text-sm text-gray-600">Mã xác minh đã gửi tới email của bạn (hết hạn sau 15 phút).</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input className="w-full" placeholder="Mã xác minh" value={fpCode} onChange={e=>setFpCode(e.target.value)} />
                    <Button variant="outline" className={`h-11 flex items-center justify-center ${verified ? 'bg-green-600 text-white' : ''}`} onClick={fpVerify} disabled={loading}>
                      {loading && !verified ? <Spinner/> : (verified ? 'Đã xác minh' : 'Xác minh mã')}
                    </Button>
                  </div>
                  <Input type="password" className="w-full" placeholder="Mật khẩu mới" value={fpNew} onChange={e=>setFpNew(e.target.value)} />
                  <Input type="password" className="w-full" placeholder="Xác nhận mật khẩu mới" value={fpConfirm} onChange={e=>setFpConfirm(e.target.value)} />
                  <Button className="w-full h-11 flex items-center justify-center" onClick={fpReset} disabled={loading || !verified}>
                    {loading ? <Spinner /> : 'Đổi mật khẩu'}
                  </Button>
                  <button className="block mx-auto text-sm text-gray-500 hover:underline" onClick={()=>{ setFpStep(1); setVerified(false); clearMsg(); }}>
                    Gửi lại mã
                  </button>
                </>
              )}
            </div>
          )}
          <div className="mt-5 text-center">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    </div>
  );
}