import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import TeamJourney from '../components/TeamJourney'

/* ---------------- WordsPullUp ---------------- */
export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative bg-[#000000] overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="h-screen w-full relative z-30">
        <div className="relative h-full w-full overflow-hidden">
          
          {/* Background video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          />

          {/* Noise overlay */}
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 lg:px-12">
            <div className="grid grid-cols-12 items-end gap-4 md:gap-8 w-full">
              
              <div className="col-span-12 md:col-span-7 xl:col-span-8">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="font-body text-xs md:text-sm text-white/80 mb-2 uppercase tracking-[0.3em] ml-2"
                >
                  World Cup 2026 Prediction Engine
                </motion.p>
                <h1
                  className="font-display leading-[0.85] tracking-tight text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[18vw] xl:text-[15vw]"
                  style={{ color: "#E1E0CC" }}
                >
                  <WordsPullUp text="ORACLE" showAsterisk />
                </h1>
              </div>

              <div className="col-span-12 flex flex-col gap-6 pb-4 md:col-span-5 xl:col-span-4 md:pb-8 lg:pl-8">
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm text-white/80 sm:text-base md:text-lg font-body"
                  style={{ lineHeight: 1.5 }}
                >
                  32 Teams. 10,000 Simulations. One Truth. The Oracle combines historical match data, Elo ratings, and XGBoost into a cinematic prediction engine.
                </motion.p>

                <div className="flex flex-wrap gap-4 mt-2">
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate('/simulate')}
                    className="group inline-flex items-center gap-2 self-start rounded-full bg-[#E1E0CC] py-1.5 pl-6 pr-1.5 text-sm font-bold text-black transition-all hover:gap-3 sm:text-base font-body tracking-wide"
                  >
                    Run Simulation
                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
                      <ArrowRight className="h-5 w-5" style={{ color: "#E1E0CC" }} />
                    </span>
                  </motion.button>
                  
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate('/methodology')}
                    className="group inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-black/40 backdrop-blur-md py-1.5 px-8 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/40 sm:text-base h-[52px] sm:h-[60px] font-body tracking-wide"
                  >
                    How it works
                  </motion.button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll-driven Top 8 Teams journey */}
      <TeamJourney />
    </div>
  )
}
