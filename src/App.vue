<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

type Portfolio = {
  basics: {
    name: string
    headline: string
    location: string
    email: string
    phone: string
    photoDataUrl: string
  }
  about: {
    bio: string
  }
  links: {
    website: string
    linkedin: string
    github: string
  }
  skills: Array<{ name: string }>
  projects: Array<{ name: string; link: string; description: string }>
  experience: Array<{ company: string; role: string; start: string; end: string; details: string }>
  projectVideoDescription: string
  projectVideoUrl: string
}

const TEMPLATE_IDS = ['template-1', 'template-2', 'template-3', 'template-4', 'template-5', 'template-6', 'template-7', 'template-8', 'template-9'] as const
type TemplateId = (typeof TEMPLATE_IDS)[number]
const templates: { id: TemplateId; name: string }[] = [
  { id: 'template-1', name: 'Template 1' },
  { id: 'template-2', name: 'Template 2' },
  { id: 'template-3', name: 'Template 3' },
  { id: 'template-4', name: 'Template 4' },
  { id: 'template-5', name: 'Template 5' },
  { id: 'template-6', name: 'Template 6' },
  { id: 'template-7', name: 'Template 7' },
  { id: 'template-8', name: 'Template 8 (Premium)' },
  { id: 'template-9', name: 'Template 9 (Premium)' },
]
const activeTemplateId = ref<TemplateId>('template-1')

const PREMIUM_PASSWORD = 'Raja@123'
const PREMIUM_KEY = 'rb:premium'
const PREMIUM_IDS: TemplateId[] = ['template-8', 'template-9']
const hasPremiumAccess = ref(false)
const showPremiumModal = ref(false)
const premiumPassword = ref('')
const premiumError = ref('')
const pendingPremiumId = ref<TemplateId | null>(null)

const STORAGE_KEY = 'rb:user'
type StoredUser = { name: string }
const userName = ref<string>('')
const showLogin = ref(true)
const isAnimating = ref(false)

function safeParseUser(raw: string | null): StoredUser | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<StoredUser>
    if (typeof parsed?.name === 'string' && parsed.name.trim()) return { name: parsed.name.trim() }
    return null
  } catch {
    return null
  }
}

onMounted(() => {
  const stored = safeParseUser(localStorage.getItem(STORAGE_KEY))
  const hasPremium = localStorage.getItem(PREMIUM_KEY) === '1'
  hasPremiumAccess.value = hasPremium
  if (stored?.name) {
    userName.value = stored.name
    showLogin.value = false
  }
})

function startExperience() {
  const name = userName.value.trim()
  if (!name) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name }))
  isAnimating.value = true
  window.setTimeout(() => {
    showLogin.value = false
    isAnimating.value = false
  }, 2200)
}

function logout() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PREMIUM_KEY)
  hasPremiumAccess.value = false
  showLogin.value = true
  isAnimating.value = false
}

function isPremium(id: TemplateId) {
  return PREMIUM_IDS.includes(id)
}

function requestTemplateChange(e: Event) {
  const target = e.target as HTMLSelectElement | null
  if (!target) return
  const id = target.value as TemplateId
  if (isPremium(id) && !hasPremiumAccess.value) {
    pendingPremiumId.value = id
    premiumPassword.value = ''
    premiumError.value = ''
    showPremiumModal.value = true
    target.value = activeTemplateId.value
    return
  }
  activeTemplateId.value = id
}

function confirmPremium() {
  if (premiumPassword.value !== PREMIUM_PASSWORD) {
    premiumError.value = 'Incorrect password. Please try again.'
    return
  }
  hasPremiumAccess.value = true
  localStorage.setItem(PREMIUM_KEY, '1')
  showPremiumModal.value = false
  premiumError.value = ''
  if (pendingPremiumId.value) {
    activeTemplateId.value = pendingPremiumId.value
  }
  pendingPremiumId.value = null
  premiumPassword.value = ''
}

function cancelPremium() {
  showPremiumModal.value = false
  premiumPassword.value = ''
  premiumError.value = ''
  pendingPremiumId.value = null
}

const portfolio = reactive<Portfolio>({
  basics: {
    name: 'Rajat',
    headline: 'Frontend Developer · Vue · UI Systems',
    location: 'India',
    email: 'rajat@example.com',
    phone: '+91 90000 00000',
    photoDataUrl: '',
  },
  about: {
    bio: 'I build clean, fast, accessible websites and web apps. I love Vue, good UI, and shipping.',
  },
  links: {
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/example',
    github: 'https://github.com/example',
  },
  skills: [{ name: 'Vue 3' }, { name: 'TypeScript' }, { name: 'CSS' }, { name: 'Vite' }],
  projects: [
    { name: 'Portfolio Builder', link: 'https://example.com', description: 'A builder that generates portfolio websites.' },
  ],
  experience: [
    { company: 'Acme Inc.', role: 'Frontend Developer', start: '2024', end: 'Present', details: 'Built reusable UI and improved performance.' },
  ],
  projectVideoDescription: '',
  projectVideoUrl: '',
})

function onPhotoSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    portfolio.basics.photoDataUrl = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(file)
}

function addSkill() {
  portfolio.skills.push({ name: '' })
}
function removeSkill(i: number) {
  portfolio.skills.splice(i, 1)
}
function addProject() {
  portfolio.projects.push({ name: '', link: '', description: '' })
}
function removeProject(i: number) {
  portfolio.projects.splice(i, 1)
}
function addExperience() {
  portfolio.experience.push({ company: '', role: '', start: '', end: '', details: '' })
}
function removeExperience(i: number) {
  portfolio.experience.splice(i, 1)
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const templateModules: Record<
  TemplateId,
  { html: () => Promise<{ default: string }>; css: () => Promise<{ default: string }>; js: () => Promise<{ default: string }> }
> = {
  'template-1': {
    html: () => import('./templates/template-1/index.html?raw'),
    css: () => import('./templates/template-1/style.css?raw'),
    js: () => import('./templates/template-1/script.js?raw'),
  },
  'template-2': {
    html: () => import('./templates/template-2/index.html?raw'),
    css: () => import('./templates/template-2/style.css?raw'),
    js: () => import('./templates/template-2/script.js?raw'),
  },
  'template-3': {
    html: () => import('./templates/template-3/index.html?raw'),
    css: () => import('./templates/template-3/style.css?raw'),
    js: () => import('./templates/template-3/script.js?raw'),
  },
  'template-4': {
    html: () => import('./templates/template-4/index.html?raw'),
    css: () => import('./templates/template-4/style.css?raw'),
    js: () => import('./templates/template-4/script.js?raw'),
  },
  'template-5': {
    html: () => import('./templates/template-5/index.html?raw'),
    css: () => import('./templates/template-5/style.css?raw'),
    js: () => import('./templates/template-5/script.js?raw'),
  },
  'template-6': {
    html: () => import('./templates/template-6/index.html?raw'),
    css: () => import('./templates/template-6/style.css?raw'),
    js: () => import('./templates/template-6/script.js?raw'),
  },
  'template-7': {
    html: () => import('./templates/template-7/index.html?raw'),
    css: () => import('./templates/template-7/style.css?raw'),
    js: () => import('./templates/template-7/script.js?raw'),
  },
  'template-8': {
    html: () => import('./templates/template-8/index.html?raw'),
    css: () => import('./templates/template-8/style.css?raw'),
    js: () => import('./templates/template-8/script.js?raw'),
  },
  'template-9': {
    html: () => import('./templates/template-9/index.html?raw'),
    css: () => import('./templates/template-9/style.css?raw'),
    js: () => import('./templates/template-9/script.js?raw'),
  },
}
function getTemplateFiles(id: TemplateId) {
  return templateModules[id]
}

function applyDataToHtml(html: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const setText = (selector: string, value: string) => {
    doc.querySelectorAll(`[data-field="${selector}"]`).forEach((el) => {
      el.textContent = value ?? ''
    })
  }
  const setAttr = (selector: string, attr: string, value: string) => {
    doc.querySelectorAll(`[data-field="${selector}"][data-attr="${attr}"]`).forEach((el) => {
      if (value?.trim()) el.setAttribute(attr, value)
      else el.removeAttribute(attr)
    })
  }

  setText('basics.name', portfolio.basics.name)
  setText('basics.headline', portfolio.basics.headline)
  setText('basics.location', portfolio.basics.location)
  setText('basics.email', portfolio.basics.email)
  setText('basics.phone', portfolio.basics.phone)
  setText('about.bio', portfolio.about.bio)

  setAttr('links.website', 'href', portfolio.links.website)
  setAttr('links.linkedin', 'href', portfolio.links.linkedin)
  setAttr('links.github', 'href', portfolio.links.github)

  // Photo: set img src and placeholder initials; toggle visibility
  const initials = portfolio.basics.name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'You'
  doc.querySelectorAll('[data-field="basics.photoPlaceholder"]').forEach((el) => {
    el.textContent = initials
  })
  doc.querySelectorAll('.avatarWrap').forEach((wrap) => {
    wrap.classList.toggle('has-photo', !!portfolio.basics.photoDataUrl)
  })
  doc.querySelectorAll('[data-field="basics.photo"]').forEach((el) => {
    if (el instanceof HTMLImageElement) {
      el.src = portfolio.basics.photoDataUrl || ''
    }
  })

  // Skills
  doc.querySelectorAll('[data-repeat="skills"]').forEach((container) => {
    container.innerHTML = portfolio.skills
      .filter((s) => s.name.trim())
      .map((s) => `<span class="chip">${esc(s.name)}</span>`)
      .join('')
  })

  // Projects
  doc.querySelectorAll('[data-repeat="projects"]').forEach((container) => {
    container.innerHTML = portfolio.projects
      .filter((p) => p.name.trim() || p.description.trim())
      .map(
        (p) => `
          <article class="card">
            <div class="cardTop">
              <h3 class="cardTitle">${esc(p.name || 'Project')}</h3>
              ${
                p.link.trim()
                  ? `<a class="cardLink" href="${esc(p.link)}" target="_blank" rel="noreferrer">Link</a>`
                  : ''
              }
            </div>
            <p class="cardDesc">${esc(p.description)}</p>
          </article>
        `,
      )
      .join('')
  })

  // Experience
  doc.querySelectorAll('[data-repeat="experience"]').forEach((container) => {
    container.innerHTML = portfolio.experience
      .filter((x) => x.company.trim() || x.role.trim() || x.details.trim())
      .map(
        (x) => `
          <div class="timelineItem">
            <div class="timelineRole">${esc(x.role || 'Role')} · <span class="muted">${esc(x.company)}</span></div>
            <div class="muted">${esc(x.start)} — ${esc(x.end)}</div>
            <div class="timelineDesc">${esc(x.details)}</div>
          </div>
        `,
      )
      .join('')
  })

  // Project video (premium templates)
  setText('project.videoDescription', portfolio.projectVideoDescription)
  setAttr('project.video', 'src', portfolio.projectVideoUrl)

  return '<!doctype html>\n' + doc.documentElement.outerHTML
}

const iframeSrcdoc = ref<string>('')

async function refreshPreview() {
  const files = getTemplateFiles(activeTemplateId.value)
  const [htmlMod, cssMod, jsMod] = await Promise.all([files.html(), files.css(), files.js()])
  const html = applyDataToHtml(htmlMod.default)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const style = doc.createElement('style')
  style.textContent = cssMod.default
  doc.head.appendChild(style)
  const script = doc.createElement('script')
  script.textContent = jsMod.default
  doc.body.appendChild(script)
  iframeSrcdoc.value = '<!doctype html>\n' + doc.documentElement.outerHTML
}

// Simple reactive refresh: rerun when anything changes (good enough for MVP)
let refreshTimer: number | undefined
function scheduleRefresh() {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => void refreshPreview(), 80)
}

// Schedule refresh on any input change by using computed getters in template (cheap approach)
const _watchBait = computed(() => JSON.stringify(portfolio))
_watchBait.value // ensure it’s tracked

async function downloadZip() {
  const files = getTemplateFiles(activeTemplateId.value)
  const [htmlMod, cssMod, jsMod] = await Promise.all([files.html(), files.css(), files.js()])
  const finalHtml = applyDataToHtml(htmlMod.default)
  const zip = new JSZip()
  zip.file('index.html', finalHtml)
  zip.file('style.css', cssMod.default)
  zip.file('script.js', jsMod.default)
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'portfolio-website.zip')
}

// initial load and when template changes
void refreshPreview()
watch(activeTemplateId, () => void refreshPreview())
</script>

<template>
  <div class="appShell">
    <div v-if="showLogin" class="authShell">
      <div v-if="!isAnimating" class="authCard">
        <div class="authBrand">
          <div class="authLogo">RB</div>
          <div class="authBrandText">
            <div class="authBrandName">Portfolio Builder</div>
            <div class="authBrandSub">Made by Rajat Kuchara</div>
          </div>
        </div>

        <div class="authForm">
          <h1 class="authTitle">Welcome</h1>
          <p class="authText">Enter your name to continue.</p>

          <label class="authField">
            <span class="authLabel">Your name</span>
            <input
              v-model="userName"
              class="authInput"
              placeholder="e.g. Rajat"
              autocomplete="name"
              @keydown.enter.prevent="startExperience"
            />
          </label>

          <button class="authBtn" type="button" :disabled="!userName.trim()" @click="startExperience">
            Continue
          </button>
        </div>
      </div>

      <div v-else class="authOverlay">
        <div class="authAnim">
          <div class="authGlow"></div>
          <div class="authAnimInner">
            <div class="authAnimLogo">RB</div>
            <div class="authAnimWelcome">
              <div class="authAnimHi">Welcome,</div>
              <div class="authAnimName">{{ userName.trim() }}</div>
            </div>
            <div class="authAnimMade">Made by Rajat Kuchara</div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
    <header class="topbar">
      <div class="brand">
        <div class="logoMark" aria-hidden="true">
          <span class="logoIcon">P</span>
        </div>
        <div class="brandMeta">
          <div class="brandName">Portfolio Builder</div>
          <div class="brandSub">Professional sites in minutes</div>
        </div>
      </div>

      <div class="actions">
        <div class="templatePicker">
          <label class="templateLabel" for="template-select">Template</label>
          <select id="template-select" class="select" :value="activeTemplateId" @change="requestTemplateChange">
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <button class="btnPrimary" type="button" @click="downloadZip">
          <span class="btnIcon">↓</span>
          Download ZIP
        </button>
        <button class="btnGhostTop" type="button" @click="logout">Logout</button>
      </div>
    </header>

    <main class="main">
      <div class="pageColumn">
        <header class="editorHero">
          <p class="heroPill">Free · No signup · 9 templates</p>
          <h1 class="heroTitle">Build your portfolio in minutes</h1>
          <p class="heroText">
            Edit below and see changes instantly. When you’re done, download the files or deploy with one click.
          </p>
          <div class="heroChips">
            <span class="heroChip">Portfolio</span>
            <span class="heroChip">Projects</span>
            <span class="heroChip">Experience</span>
          </div>
        </header>

        <div class="editorBody">
          <section class="block">
            <div class="blockHeader">
              <h2 class="blockTitle">Hero section</h2>
              <p class="blockHint">This is the first thing visitors see.</p>
            </div>

            <div class="profileCard">
              <div class="profileMain">
                <div class="profileAvatar">
                  <span>{{ portfolio.basics.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() }}</span>
                </div>
                <div class="profileText">
                  <input
                    v-model="portfolio.basics.name"
                    class="inlineTitle"
                    placeholder="Your name"
                    @input="scheduleRefresh"
                  />
                  <input
                    v-model="portfolio.basics.headline"
                    class="inlineSubtitle"
                    placeholder="Role · What you do best"
                    @input="scheduleRefresh"
                  />
                </div>
              </div>

              <div class="profileMeta">
                <input
                  v-model="portfolio.basics.location"
                  class="inlineMeta"
                  placeholder="Location"
                  @input="scheduleRefresh"
                />
                <input
                  v-model="portfolio.basics.email"
                  class="inlineMeta"
                  placeholder="Email"
                  @input="scheduleRefresh"
                />
                <input
                  v-model="portfolio.basics.phone"
                  class="inlineMeta"
                  placeholder="Phone"
                  @input="scheduleRefresh"
                />
              </div>

              <div class="profileLinks">
                <input
                  v-model="portfolio.links.website"
                  class="inlineLink"
                  placeholder="Website URL"
                  @input="scheduleRefresh"
                />
                <input
                  v-model="portfolio.links.linkedin"
                  class="inlineLink"
                  placeholder="LinkedIn"
                  @input="scheduleRefresh"
                />
                <input
                  v-model="portfolio.links.github"
                  class="inlineLink"
                  placeholder="GitHub"
                  @input="scheduleRefresh"
                />
              </div>
            </div>

            <div class="aboutBlock">
              <div class="aboutLabel">About you</div>
              <textarea
                v-model="portfolio.about.bio"
                class="inlineBody"
                rows="4"
                placeholder="Share a short story about who you are, what you build, and what you care about."
                @input="scheduleRefresh"
              />
            </div>

            <div class="photoUpload">
              <label class="photoLabel">
                <span>Profile photo</span>
                <input
                  class="photoInput"
                  type="file"
                  accept="image/*"
                  @change="(e) => {
                    onPhotoSelected(e);
                    scheduleRefresh();
                  }"
                />
              </label>
            </div>
          </section>

          <section class="block">
            <div class="blockHeader">
              <h2 class="blockTitle">Skills</h2>
              <p class="blockHint">These appear as chips on your site.</p>
            </div>

            <div class="skillsChips">
              <button
                v-for="(s, i) in portfolio.skills"
                :key="i"
                class="skillChip"
                type="button"
              >
                <input
                  v-model="s.name"
                  class="skillInput"
                  placeholder="Skill"
                  @input="scheduleRefresh"
                />
                <span class="skillRemove" @click.stop="removeSkill(i)">×</span>
              </button>
              <button class="btnSoft" type="button" @click="addSkill">+ Add skill</button>
            </div>
          </section>

          <section class="block">
            <div class="blockHeader">
              <h2 class="blockTitle">Projects</h2>
              <p class="blockHint">Highlight a few projects you’re proud of.</p>
            </div>

            <div class="list">
              <article v-for="(p, i) in portfolio.projects" :key="i" class="cardEdit">
                <div class="cardEditHeader">
                  <input
                    v-model="p.name"
                    class="inlineCardTitle"
                    placeholder="Project name"
                    @input="scheduleRefresh"
                  />
                  <input
                    v-model="p.link"
                    class="inlineCardLink"
                    placeholder="Project link"
                    @input="scheduleRefresh"
                  />
                </div>
                <textarea
                  v-model="p.description"
                  class="inlineBody"
                  rows="3"
                  placeholder="What did you build, and what impact did it have?"
                  @input="scheduleRefresh"
                />
                <button class="btnGhost btnGhostFull" type="button" @click="removeProject(i)">
                  Remove project
                </button>
              </article>
              <button class="btnSoft" type="button" @click="addProject">+ Add project</button>
            </div>
          </section>

          <section class="block">
            <div class="blockHeader">
              <h2 class="blockTitle">Project video (premium)</h2>
              <p class="blockHint">First add a short description, then a main project video link.</p>
            </div>
            <label class="field">
              <span>Description above the video</span>
              <textarea
                v-model="portfolio.projectVideoDescription"
                class="textarea"
                rows="3"
                placeholder="Explain what this project video is about."
                @input="scheduleRefresh"
              />
            </label>
            <label class="field">
              <span>Video URL (e.g. mp4 or hosted link)</span>
              <input
                v-model="portfolio.projectVideoUrl"
                class="input"
                placeholder="https://..."
                @input="scheduleRefresh"
              />
            </label>
          </section>

          <section class="block">
            <div class="blockHeader">
              <h2 class="blockTitle">Experience</h2>
              <p class="blockHint">Give context on your past roles.</p>
            </div>

            <div class="list">
              <article v-for="(x, i) in portfolio.experience" :key="i" class="cardEdit">
                <div class="cardEditHeader">
                  <input
                    v-model="x.role"
                    class="inlineCardTitle"
                    placeholder="Role"
                    @input="scheduleRefresh"
                  />
                  <input
                    v-model="x.company"
                    class="inlineCardLink"
                    placeholder="Company"
                    @input="scheduleRefresh"
                  />
                </div>
                <div class="experienceMeta">
                  <input
                    v-model="x.start"
                    class="inlineMeta"
                    placeholder="Start year"
                    @input="scheduleRefresh"
                  />
                  <span class="experienceDash">—</span>
                  <input
                    v-model="x.end"
                    class="inlineMeta"
                    placeholder="End year / Present"
                    @input="scheduleRefresh"
                  />
                </div>
                <textarea
                  v-model="x.details"
                  class="inlineBody"
                  rows="3"
                  placeholder="Summarize your impact, responsibilities, and what you shipped."
                  @input="scheduleRefresh"
                />
                <button class="btnGhost btnGhostFull" type="button" @click="removeExperience(i)">
                  Remove experience
                </button>
              </article>
              <button class="btnSoft" type="button" @click="addExperience">+ Add experience</button>
            </div>
          </section>
        </div>
      </div>

      <aside class="previewColumn">
        <div class="previewFrame">
          <div class="previewBar">
            <span class="previewLabel">Live preview</span>
            <span class="previewDot"></span>
          </div>
          <div class="iframeWrap">
            <iframe class="iframe" :srcdoc="iframeSrcdoc" title="Website preview" />
          </div>
        </div>
      </aside>
    </main>

    <div v-if="showPremiumModal" class="premiumOverlay">
      <div class="premiumCard">
        <h2 class="premiumTitle">Unlock premium templates</h2>
        <p class="premiumText">
          Enter the access password to use the premium templates with video sections.
        </p>
        <label class="premiumField">
          <span class="premiumLabel">Password</span>
          <input
            v-model="premiumPassword"
            class="premiumInput"
            type="password"
            placeholder="Enter password"
            @keydown.enter.prevent="confirmPremium"
          />
        </label>
        <p v-if="premiumError" class="premiumError">{{ premiumError }}</p>
        <div class="premiumActions">
          <button class="premiumBtnGhost" type="button" @click="cancelPremium">Cancel</button>
          <button class="premiumBtn" type="button" @click="confirmPremium">Unlock</button>
        </div>
        <p class="premiumHint">Hint: password is Raja@123</p>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped>
/* Professional builder UI — Plus Jakarta Sans, refined dark theme */
.appShell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  background: #030712;
  color: #e5e7eb;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.authShell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  background:
    radial-gradient(900px 500px at 20% 0%, rgba(13, 148, 136, 0.22), transparent 60%),
    radial-gradient(900px 500px at 80% 0%, rgba(34, 197, 94, 0.18), transparent 55%),
    radial-gradient(1200px 700px at 50% 120%, rgba(15, 23, 42, 0.95), #030712);
}
.authCard {
  width: min(520px, 100%);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(15, 23, 42, 0.78);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
.authBrand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 18px 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.authLogo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(145deg, #0d9488, #059669);
  display: grid;
  place-items: center;
  font-weight: 900;
  letter-spacing: -0.04em;
  box-shadow: 0 6px 18px rgba(13, 148, 136, 0.35);
}
.authBrandText {
  display: grid;
  gap: 2px;
}
.authBrandName {
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f9fafb;
}
.authBrandSub {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}
.authForm {
  padding: 20px 18px 18px;
}
.authTitle {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.03em;
  color: #f9fafb;
}
.authText {
  margin: 8px 0 16px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}
.authField {
  display: grid;
  gap: 8px;
}
.authLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}
.authInput {
  height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(2, 6, 23, 0.7);
  color: #f1f5f9;
  font-size: 14px;
  font-family: inherit;
}
.authInput:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
}
.authBtn {
  margin-top: 14px;
  width: 100%;
  height: 46px;
  border-radius: 12px;
  border: 0;
  background: linear-gradient(135deg, #0d9488, #059669);
  color: #fff;
  font-weight: 700;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(13, 148, 136, 0.28);
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}
.authBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(13, 148, 136, 0.34);
}
.authBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}
.authOverlay {
  position: fixed;
  inset: 0;
  background: #000;
  display: grid;
  place-items: center;
  z-index: 50;
}
.authAnim {
  position: relative;
  padding: 34px 24px 30px;
  display: grid;
  place-items: center;
}
.authGlow {
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 50% 30%, rgba(13, 148, 136, 0.35), transparent 55%);
  filter: blur(24px);
  animation: authGlow 2.2s ease-in-out forwards;
}
@keyframes authGlow {
  0% { opacity: 0; transform: scale(0.9); }
  30% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.05); }
}
.authAnimInner {
  position: relative;
  display: grid;
  gap: 10px;
  text-align: center;
}
.authAnimLogo {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  margin: 0 auto;
  display: grid;
  place-items: center;
  font-weight: 900;
  letter-spacing: -0.05em;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #0d9488, #22c55e);
  box-shadow: 0 18px 45px rgba(13, 148, 136, 0.38);
  animation: pop 0.5s ease-out both;
}
@keyframes pop {
  from { transform: translateY(6px) scale(0.96); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.authAnimHi {
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.authAnimName {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #f9fafb;
}
.authAnimMade {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 16px 28px;
  background: rgba(3, 7, 18, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
}
.logoMark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(145deg, #0d9488 0%, #059669 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.04em;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.4);
}
.logoIcon {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.brandMeta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.brandName {
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #f9fafb;
  font-size: 1.1rem;
}
.brandSub {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 14px;
  align-items: center;
}
.templatePicker {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.templateLabel {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
}
.select {
  height: 40px;
  min-width: 140px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.8);
  color: #f1f5f9;
  font-weight: 500;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.select:hover {
  border-color: rgba(255, 255, 255, 0.18);
}
.select:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
}
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.btnPrimary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.45);
}
.btnPrimary:active {
  transform: translateY(0);
}
.btnPrimary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.btnIcon {
  font-size: 16px;
  opacity: 0.9;
}

.btnGhostTop {
  height: 40px;
  border-radius: 10px;
  padding: 0 14px;
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}
.btnGhostTop:hover {
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
}

.main {
  flex: 1;
  width: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0;
}

.pageColumn {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 32px 36px 48px;
  background: #030712;
}

.editorBody {
  padding: 0;
  width: 100%;
}

.editorHero {
  padding: 0 0 32px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.heroPill {
  display: inline-block;
  margin: 0 0 16px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5eead4;
  background: rgba(13, 148, 136, 0.15);
  border: 1px solid rgba(13, 148, 136, 0.3);
}
.heroTitle {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #f9fafb;
  line-height: 1.25;
  margin: 0;
}
.heroText {
  margin-top: 12px;
  font-size: 14px;
  color: #94a3b8;
  max-width: 520px;
  line-height: 1.6;
}
.heroChips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}
.heroChip {
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.block {
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.block:hover {
  border-color: rgba(255, 255, 255, 0.1);
}
.block:first-of-type { border-left: 3px solid #0d9488; }
.block:nth-of-type(2) { border-left: 3px solid #f59e0b; }
.block:nth-of-type(3) { border-left: 3px solid #0d9488; }
.block:nth-of-type(4) { border-left: 3px solid #f59e0b; }
.blockHeader {
  margin-bottom: 14px;
}
.blockTitle {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}
.blockHint {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.field {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: #9ca3af;
}
.fieldTight {
  margin-top: 6px;
}
.input,
.textarea {
  border: 1px solid #1f2937;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  background: #020617;
  color: #e5e7eb;
}
.textarea {
  resize: vertical;
}
.divider {
  height: 1px;
  background: #111827;
  margin: 14px 0;
}
.hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

.list {
  display: grid;
  gap: 12px;
  margin-top: 10px;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}
.cardEdit {
  border: 1px solid #1f2937;
  border-radius: 14px;
  padding: 14px 14px 16px;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), #020617 80%);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.9);
}
.btnSoft {
  height: 38px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.14);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.5);
  font-weight: 600;
  font-size: 13px;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btnSoft:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}
.btnGhost {
  height: 36px;
  border-radius: 10px;
  background: transparent;
  color: #9ca3af;
  border: 1px solid #1f2937;
  font-size: 12px;
  font-weight: 500;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.btnGhost:hover {
  color: #e5e7eb;
  border-color: #4b5563;
}
.btnGhostFull {
  width: 100%;
  margin-top: 10px;
}

.profileCard {
  border-radius: 16px;
  padding: 16px 16px 18px;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), #020617 75%);
  border: 1px solid rgba(15, 23, 42, 0.9);
  display: grid;
  gap: 12px;
}
.profileMain {
  display: flex;
  gap: 12px;
  align-items: center;
}
.profileAvatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: linear-gradient(145deg, #0d9488 0%, #0f766e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}
.profileText {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.inlineTitle {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 18px;
  font-weight: 700;
  color: #f9fafb;
}
.inlineSubtitle {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  color: #9ca3af;
}
.inlineTitle:focus,
.inlineSubtitle:focus {
  outline: none;
  box-shadow: 0 2px 0 0 #22c55e;
}
.profileMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.inlineMeta {
  min-width: 120px;
  max-width: 150px;
  border: none;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  color: #e5e7eb;
  border: 1px solid #1f2937;
}
.inlineMeta:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
}
.profileLinks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.inlineLink {
  min-width: 140px;
  border-radius: 999px;
  border: none;
  padding: 6px 12px;
  font-size: 11px;
  color: #bbf7d0;
  background: rgba(34, 197, 94, 0.16);
  font-weight: 600;
}
.inlineLink:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
}

.aboutBlock {
  margin-top: 14px;
}
.aboutLabel {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.inlineBody {
  width: 100%;
  border-radius: 10px;
  border: 1px dashed #1f2937;
  background: #020617;
  padding: 10px 12px;
  font-size: 13px;
  color: #e5e7eb;
  resize: vertical;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.inlineBody:focus {
  outline: none;
  border-style: solid;
  border-color: #22c55e;
  background: #020617;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
}

.photoUpload {
  margin-top: 12px;
}
.photoLabel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}
.photoInput {
  font-size: 11px;
}

.skillsChips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.skillChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(34, 197, 94, 0.4);
  background: rgba(15, 23, 42, 0.9);
}
.skillInput {
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #e5e7eb;
  min-width: 56px;
}
.skillInput::placeholder {
  color: #6b7280;
}
.skillInput:focus {
  outline: none;
}
.skillRemove {
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  color: #9ca3af;
  opacity: 0.8;
}
.skillRemove:hover {
  color: #e5e7eb;
}

.cardEditHeader {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 8px;
}
.inlineCardTitle {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  color: #f9fafb;
}
.inlineCardLink {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #bbf7d0;
  font-weight: 500;
}
.inlineCardTitle:focus,
.inlineCardLink:focus {
  outline: none;
  box-shadow: 0 2px 0 0 #22c55e;
}

.experienceMeta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 8px;
}
.experienceDash {
  font-size: 12px;
  color: #6b7280;
}

.previewColumn {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #030712;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
}

.previewFrame {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 24px 24px;
}
.previewBar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 0;
}
.previewLabel {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
}
.previewDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.iframeWrap {
  flex: 1;
  min-height: 0;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 12px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}
.iframe {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 0;
  display: block;
  background: #fff;
}

.premiumOverlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  z-index: 40;
}
.premiumCard {
  width: min(420px, 100% - 32px);
  border-radius: 16px;
  padding: 20px 20px 18px;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.5);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
}
.premiumTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f9fafb;
}
.premiumText {
  margin: 8px 0 14px;
  font-size: 13px;
  color: #94a3b8;
}
.premiumField {
  display: grid;
  gap: 6px;
}
.premiumLabel {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}
.premiumInput {
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  padding: 0 12px;
  font-family: inherit;
  font-size: 14px;
}
.premiumInput:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.5);
}
.premiumError {
  margin: 6px 0 0;
  font-size: 12px;
  color: #f97373;
}
.premiumActions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.premiumBtn {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 0;
  background: linear-gradient(135deg, #0d9488, #059669);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.premiumBtnGhost {
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: transparent;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.premiumHint {
  margin-top: 10px;
  font-size: 11px;
  color: #6b7280;
}

@media (max-width: 980px) {
  .main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .pageColumn {
    padding: 20px 20px 32px;
  }
  .previewColumn {
    border-left: none;
    border-top: 1px solid rgba(13, 148, 136, 0.1);
  }
  .previewFrame {
    padding: 16px;
  }
  .iframe {
    min-height: 70vh;
  }
}
</style>
