import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, BarChart3, Info, Database, Menu, X, Play } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: null },
  { path: '/about', label: 'About', icon: <Info className="w-3.5 h-3.5" /> },
  { path: '/methodology', label: 'Methodology', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { path: '/simulate', label: 'Simulation', icon: <Play className="w-3.5 h-3.5" /> },
  { path: '/data', label: 'Data', icon: <Database className="w-3.5 h-3.5" /> },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#000000]/95 backdrop-blur-xl border-b border-white/10 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">

          {/* Logo */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/60 transition-all duration-300">
              <Trophy className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-display text-white text-lg tracking-widest hidden md:block">
              WC ORACLE
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-sm">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-body tracking-wider transition-all duration-200 flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'text-[#000000]'
                    : 'text-text-muted hover:text-white'
                }`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 uppercase">
                  {item.icon}
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Toggle */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[68px] left-4 right-4 z-40 bg-[#000000]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl md:hidden overflow-hidden"
          >
            <div className="p-3 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-body transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white/15 text-white border border-white/30'
                      : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="uppercase tracking-wider text-xs">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
