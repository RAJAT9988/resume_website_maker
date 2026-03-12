<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
  { id: 'template-8', name: 'Template 8' },
  { id: 'template-9', name: 'Template 9' },
]
const activeTemplateId = ref<TemplateId>('template-1')

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
    <header class="topbar">
      <div class="brand">
        <div class="logoMark">RB</div>
        <div class="brandMeta">
          <div class="brandName">Resume Builder</div>
          <div class="brandSub">Create a clean, professional portfolio in minutes.</div>
        </div>
      </div>

      <div class="actions">
        <label class="selectWrap">
          <span class="selectLabel">Template</span>
          <select v-model="activeTemplateId" class="select">
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </label>
        <button class="btnPrimary" type="button" @click="downloadZip">Download ZIP</button>
      </div>
    </header>

    <main class="main">
      <div class="pageColumn">
        <header class="editorHero">
          <h1 class="heroTitle">Design your personal website in minutes.</h1>
          <p class="heroText">
            Edit the sections below — the preview updates as you type.
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
          <iframe class="iframe" :srcdoc="iframeSrcdoc" title="Website preview" />
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
/* ---- Dark mode palette: slate + teal accent ---- */
.appShell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  background: radial-gradient(circle at top, #020617 0%, #020617 40%, #020617 100%);
  color: #e5e7eb;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(15, 23, 42, 1);
  box-shadow:
    0 1px 0 rgba(148, 163, 184, 0.08),
    0 18px 40px rgba(15, 23, 42, 0.85);
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
}
.logoMark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(145deg, #0d9488 0%, #0f766e 50%, #115e59 100%);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
}
.brandMeta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.brandName {
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #f9fafb;
  font-size: 1.05rem;
}
.brandSub {
  font-size: 12px;
  color: #9ca3af;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.selectWrap {
  display: grid;
  gap: 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
}
.selectLabel {
  font-weight: 600;
}
.select {
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  font-weight: 500;
}
.select:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
}
.btnPrimary {
  height: 38px;
  border-radius: 10px;
  padding: 0 18px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btnPrimary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.6);
}
.btnPrimary:active {
  transform: translateY(0);
}
.btnPrimary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  padding: 28px 32px 40px;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), #020617 55%, #020617 100%);
}

.editorBody {
  padding: 0;
  width: 100%;
}

.editorHero {
  padding: 0 0 28px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(13, 148, 136, 0.12);
}
.heroTitle {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f9fafb;
  line-height: 1.3;
}
.heroText {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
  max-width: 480px;
  line-height: 1.5;
}
.heroChips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.heroChip {
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #bbf7d0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.block {
  border-radius: 16px;
  padding: 16px 18px 18px;
  margin-bottom: 16px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #1f2937;
  box-shadow:
    0 16px 35px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(15, 23, 42, 0.8);
}
.block:first-of-type { border-left: 3px solid #0d9488; }
.block:nth-of-type(2) { border-left: 3px solid #b45309; }
.block:nth-of-type(3) { border-left: 3px solid #0d9488; }
.block:nth-of-type(4) { border-left: 3px solid #b45309; }
.blockHeader {
  margin-bottom: 12px;
}
.blockTitle {
  font-size: 14px;
  font-weight: 700;
  color: #f9fafb;
  letter-spacing: -0.01em;
}
.blockHint {
  margin-top: 2px;
  font-size: 12px;
  color: #9ca3af;
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
  background: rgba(13, 148, 136, 0.16);
  border-color: rgba(13, 148, 136, 0.35);
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
  background: radial-gradient(circle at top right, #020617 0%, #020617 40%, #020617 100%);
  border-left: 1px solid #020617;
}

.previewFrame {
  flex: 1;
  min-height: 0;
  padding: 24px 28px 28px;
  background: radial-gradient(circle at top, rgba(15, 23, 42, 1), rgba(15, 23, 42, 0.9) 55%, rgba(15, 23, 42, 0.8) 100%);
}
.iframe {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
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
