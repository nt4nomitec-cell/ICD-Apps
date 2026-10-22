import { useState } from 'react';

export default function VercelGuide() {
  const [method, setMethod] = useState<'github' | 'cli' | 'drag'>('github');

  return (
    <div>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
            <span className="text-3xl">▲</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Vercel Se FREE Live Karein</h2>
            <p className="text-gray-300 text-sm">Step by step complete guide - bilkul FREE!</p>
          </div>
        </div>
      </div>

      {/* Method Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setMethod('github')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${method === 'github' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          🐙 GitHub + Vercel (Recommended)
        </button>
        <button
          onClick={() => setMethod('cli')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${method === 'cli' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          💻 Vercel CLI (Terminal Se)
        </button>
        <button
          onClick={() => setMethod('drag')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${method === 'drag' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          📁 Direct Upload
        </button>
      </div>

      {/* GitHub + Vercel Method */}
      {method === 'github' && (
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">Node.js Install Karein</h3>
                <p className="text-gray-600 mt-1">Pehle Node.js install karna zaroori hai</p>
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm">👉 <a href="https://nodejs.org" target="_blank" className="text-blue-600 underline font-bold">https://nodejs.org</a></p>
                  <p className="text-sm mt-1">LTS version download karein aur install karein</p>
                </div>
                <div className="mt-3 bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">
                  <p className="text-gray-400"># Verify karein ke install ho gaya:</p>
                  <p>node --version</p>
                  <p>npm --version</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">GitHub Account Banayein</h3>
                <p className="text-gray-600 mt-1">Free account banayein agar nahi hai</p>
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm">👉 <a href="https://github.com/signup" target="_blank" className="text-blue-600 underline font-bold">https://github.com/signup</a></p>
                  <p className="text-sm mt-1">Email se free account banayein</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">Naya Repository Banayein</h3>
                <p className="text-gray-600 mt-1">GitHub par naya repo banayein</p>
                <div className="mt-3 space-y-2 text-sm">
                  <p>1. GitHub login karein</p>
                  <p>2. Upar right corner mein <strong>"+"</strong> icon par click karein</p>
                  <p>3. <strong>"New repository"</strong> select karein</p>
                  <p>4. Repository name: <code className="bg-gray-100 px-2 py-0.5 rounded">icd-app</code></p>
                  <p>5. <strong>"Public"</strong> select karein</p>
                  <p>6. <strong>"Create repository"</strong> button dabayein</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">Apni Files Upload Karein</h3>
                <p className="text-gray-600 mt-1">Terminal se ya GitHub website se files upload karein</p>

                <div className="mt-3 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                  <p className="text-gray-400"># Apni downloaded files wale folder mein jayein</p>
                  <p>cd Downloads/ICD-App</p>
                  <br />
                  <p className="text-gray-400"># Git initialize karein</p>
                  <p>git init</p>
                  <br />
                  <p className="text-gray-400"># Sare files add karein</p>
                  <p>git add .</p>
                  <br />
                  <p className="text-gray-400"># Commit karein</p>
                  <p>git commit -m "ICD Cold Drink App"</p>
                  <br />
                  <p className="text-gray-400"># Branch rename karein</p>
                  <p>git branch -M main</p>
                  <br />
                  <p className="text-gray-400"># GitHub se connect karein (apna username dalein)</p>
                  <p>git remote add origin https://github.io/YOUR-USERNAME/icd-app.git</p>
                  <br />
                  <p className="text-gray-400"># Push karein</p>
                  <p>git push -u origin main</p>
                </div>

                <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    ⚠️ <strong>Ya phir Asaan Tareeqa:</strong> GitHub website par ja kar repo mein "uploading an existing file" link par click karein aur apni sari 17 files drag & drop kar dein.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">5</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">Vercel Account Banayein</h3>
                <p className="text-gray-600 mt-1">GitHub se login karein</p>
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm">👉 <a href="https://vercel.com/signup" target="_blank" className="text-blue-600 underline font-bold">https://vercel.com/signup</a></p>
                  <p className="text-sm mt-1"><strong>"Continue with GitHub"</strong> par click karein - sab se asaan hai!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">6</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">Project Import Karein</h3>
                <p className="text-gray-600 mt-1">Vercel mein apna GitHub repo import karein</p>
                <div className="mt-3 space-y-2 text-sm">
                  <p>1. Vercel dashboard par <strong>"Add New..."</strong> → <strong>"Project"</strong> par click karein</p>
                  <p>2. Apna <strong>"icd-app"</strong> repository dhoondhein</p>
                  <p>3. <strong>"Import"</strong> button dabayein</p>
                  <p>4. Framework Preset: <strong>"Vite"</strong> select karein (auto detect ho jayega)</p>
                  <p>5. <strong>"Deploy"</strong> button dabayein</p>
                </div>
                <div className="mt-3 bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-green-700 font-bold text-lg">✅ 1-2 minute mein aap ki website LIVE ho jayegi!</p>
                  <p className="text-green-600 text-sm mt-1">Free URL milega: <code className="bg-green-100 px-2 py-0.5 rounded">https://icd-app.vercel.app</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLI Method */}
      {method === 'cli' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-lg text-gray-800 mb-4">💻 Terminal Se Direct Deploy Karein</h3>
            <p className="text-gray-600 mb-4">Agar GitHub use nahi karna chahte to yeh tareeqa use karein:</p>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 space-y-3">
              <div>
                <p className="text-gray-400"># Step 1: Folder mein jayein</p>
                <p>cd Downloads/ICD-App</p>
              </div>
              <div>
                <p className="text-gray-400"># Step 2: Packages install karein</p>
                <p>npm install</p>
              </div>
              <div>
                <p className="text-gray-400"># Step 3: Vercel CLI install karein</p>
                <p>npm install -g vercel</p>
              </div>
              <div>
                <p className="text-gray-400"># Step 4: Deploy karein</p>
                <p>vercel</p>
              </div>
              <div>
                <p className="text-gray-400"># Vercel aapse kuch sawal puchega:</p>
                <p className="text-yellow-400"># ? Set up and deploy? → Y</p>
                <p className="text-yellow-400"># ? Which scope? → Apna account select karein</p>
                <p className="text-yellow-400"># ? Link to existing project? → N</p>
                <p className="text-yellow-400"># ? Project name → icd-app</p>
                <p className="text-yellow-400"># ? Directory → ./ (default)</p>
                <p className="text-yellow-400"># ? Override settings? → N</p>
              </div>
              <div>
                <p className="text-gray-400"># Step 5: Production par deploy karein</p>
                <p>vercel --prod</p>
              </div>
              <div>
                <p className="text-green-300 font-bold">✅ DONE! Aap ki website LIVE hai!</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">📝 Pehli Baar Login:</h4>
            <p className="text-sm text-blue-700">
              Jab aap pehli baar <code className="bg-blue-100 px-1 rounded">vercel</code> command chalayein ge to browser mein ek link khulega.
              Wahan GitHub ya Email se login karein. Uske baad terminal mein automatically deploy shuru ho jayega.
            </p>
          </div>
        </div>
      )}

      {/* Drag & Drop Method */}
      {method === 'drag' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <h3 className="font-bold text-lg text-gray-800 mb-4">📁 Build Folder Direct Upload Karein</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-700 mb-2">Step 1: Build Karein</h4>
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">
                  <p>cd Downloads/ICD-App</p>
                  <p>npm install</p>
                  <p>npm run build</p>
                  <p className="text-gray-400"># "dist" folder ban jayega</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-700 mb-2">Step 2: Vercel Par Upload Karein</h4>
                <div className="space-y-2 text-sm">
                  <p>1. 👉 <a href="https://vercel.com/new" target="_blank" className="text-blue-600 underline font-bold">https://vercel.com/new</a> par jayein</p>
                  <p>2. Login karein (GitHub/Email)</p>
                  <p>3. Neeche scroll karein</p>
                  <p>4. <strong>"Deploy without Git"</strong> ya <strong>"Browse"</strong> option par click karein</p>
                  <p>5. Apna <code className="bg-gray-200 px-1 rounded">dist</code> folder select karein</p>
                  <p>6. ✅ Deploy ho jayega!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">⚠️ Yaad Rakhein:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <code className="bg-amber-100 px-1 rounded">dist</code> folder upload karna hai, poora project nahi</li>
              <li>• Pehle <code className="bg-amber-100 px-1 rounded">npm run build</code> zaroor karein</li>
              <li>• Agar build nahi kiya to <code className="bg-amber-100 px-1 rounded">dist</code> folder nahi banega</li>
            </ul>
          </div>
        </div>
      )}

      {/* After Deploy */}
      <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-3">✅ Deploy Ke Baad Kya Karein?</h3>
        <div className="space-y-2 text-green-100">
          <p>1️⃣ Aap ko ek free URL milega: <code className="bg-white/20 px-2 py-0.5 rounded">https://icd-app.vercel.app</code></p>
          <p>2️⃣ Yeh URL apne customers ko share karein</p>
          <p>3️⃣ Admin login: Password = <code className="bg-white/20 px-2 py-0.5 rounded">admin123</code></p>
          <p>4️⃣ Customer login: Phone + Password (jo admin ne set kiya ho)</p>
          <p>5️⃣ Har roz Backup download karein!</p>
        </div>
      </div>

      {/* Custom Domain */}
      <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="font-bold text-gray-800 mb-3">🌐 Custom Domain (Optional)</h3>
        <p className="text-gray-600 text-sm mb-3">Agar aap apna domain lena chahte hain (jaise icd.com):</p>
        <div className="space-y-2 text-sm">
          <p>1. Kisi bhi domain provider se domain kharidein (Namecheap, GoDaddy)</p>
          <p>2. Vercel dashboard → Settings → Domains par jayein</p>
          <p>3. Apna domain add karein</p>
          <p>4. DNS settings update karein</p>
          <p>5. ✅ Free SSL bhi mil jayega!</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <a href="https://vercel.com/signup" target="_blank" className="bg-gray-900 text-white rounded-xl p-4 text-center hover:opacity-90 transition">
          <p className="text-2xl mb-1">▲</p>
          <p className="font-bold">Vercel Signup</p>
          <p className="text-xs text-gray-400">Account banayein</p>
        </a>
        <a href="https://github.com/signup" target="_blank" className="bg-gray-800 text-white rounded-xl p-4 text-center hover:opacity-90 transition">
          <p className="text-2xl mb-1">🐙</p>
          <p className="font-bold">GitHub Signup</p>
          <p className="text-xs text-gray-400">Free account</p>
        </a>
        <a href="https://nodejs.org" target="_blank" className="bg-green-700 text-white rounded-xl p-4 text-center hover:opacity-90 transition">
          <p className="text-2xl mb-1">🟢</p>
          <p className="font-bold">Node.js Download</p>
          <p className="text-xs text-green-200">LTS Version</p>
        </a>
      </div>
    </div>
  );
}
