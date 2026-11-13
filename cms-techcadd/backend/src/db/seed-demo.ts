import { execute, pool, queryOne, type Row } from './pool.js'
import * as blogsRepo from '../modules/blogs/blogs.repo.js'
import { blogSchema } from '../modules/blogs/blogs.schema.js'
import * as caseStudiesRepo from '../modules/case_studies/case_studies.repo.js'
import { caseStudySchema } from '../modules/case_studies/case_studies.schema.js'
import * as portfolioRepo from '../modules/portfolio/portfolio.repo.js'
import { portfolioSchema } from '../modules/portfolio/portfolio.schema.js'
import * as testimonialsRepo from '../modules/testimonials/testimonials.repo.js'
import { testimonialSchema } from '../modules/testimonials/testimonials.schema.js'

/**
 * Demo content for the XAI Robotics website: case studies, portfolio items,
 * blog posts and testimonials, all published, so the site's sections have
 * something to render before the real content is written.
 *
 *   npm run db:seed-demo
 *
 * Everything here is sample copy — the schools, partners and people are
 * fictional. Idempotent: a row whose slug (or, for testimonials, name) already
 * exists is skipped, never overwritten, so an edited demo row survives a re-run
 * and real content with the same slug is left alone.
 *
 * Written through the modules' own create functions with the API's schemas, so
 * the rows pass exactly the checks an editor's save would: slug format, fixed
 * category lists, the publish checks, HTML sanitising, read time and tags.
 *
 * FAQs are not here — migration 062 seeds them.
 */

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

const CASE_STUDIES = [
  {
    title: 'A robotics lab for a CBSE school in eight weeks',
    slug: 'robotics-lab-for-cbse-school',
    client: 'Greenfield Public School (sample client)',
    industry: 'K-12 Education',
    category: 'schools',
    serviceSlug: 'franchise-b2b',
    icon: 'cap',
    excerpt:
      'We designed, equipped and staffed an after-school robotics lab for 240 students in Classes 6–10, from empty classroom to first robot show in eight weeks.',
    duration: '8 weeks setup, ongoing programme',
    results: [
      { value: '240', label: 'students enrolled in the first term' },
      { value: '36', label: 'working robots shown at the term-end exhibition' },
      { value: '3', label: 'teachers trained to run sessions independently' },
    ],
    technologies: ['Arduino Uno', 'ESP32', 'Ultrasonic & IR sensors', 'Servo motors', 'Block coding', 'C/C++'],
    overview:
      '<p>Greenfield Public School wanted hands-on robotics for its middle and senior classes, but had no lab, no kits and no teacher with an electronics background.</p>',
    challenge:
      '<p>The school needed a lab that could run four sessions a day, survive enthusiastic Class 6 students, and be taught by its own staff within a term. Off-the-shelf kits it had tried before ended up in cupboards because nobody knew what to do after the first lesson.</p>',
    approach:
      '<p>We started with the timetable rather than the kit list: 40-minute periods, 30 students per batch, and a teacher who would take over by week six. Every lesson was planned to end with something that moves.</p><ul><li>Layout and safety plan for a 600 sq ft room</li><li>A 24-week lesson sequence mapped to the CBSE AI and coding electives</li><li>Teacher shadowing for the first six weeks</li></ul>',
    solution:
      '<p>Fifteen workstations, each with an ESP32 kit, a sensor tray and a shared 3D printer corner. Students progress from line-following cars to obstacle-avoiding rovers, then build a group project for the term-end show.</p>',
    implementation:
      '<p>Furniture and power were installed in week one, kits arrived in week two and classes began in week three. Our instructor co-taught for six weeks, then handed over with fortnightly support visits.</p>',
    testimonialText:
      'Our students used to ask when the robotics class was. Now they ask if they can stay after school for it. The lab runs itself, and our own teachers are confident leading it.',
    testimonialName: 'Ritu Malhotra (sample)',
    testimonialRole: 'Principal, Greenfield Public School',
    sortOrder: 1,
  },
  {
    title: 'An engineering college robotics club that ships real builds',
    slug: 'engineering-college-robotics-club',
    client: 'Northbridge Institute of Technology (sample client)',
    industry: 'Higher Education',
    category: 'colleges-universities',
    serviceSlug: 'robotics-programme',
    icon: 'rocket',
    excerpt:
      'A semester-long partnership that turned a dormant robotics club into a team of 48 students building self-balancing robots, a Stewart platform and an autonomous maze solver.',
    duration: '1 semester (5 months)',
    results: [
      { value: '48', label: 'students completed the foundation phase' },
      { value: '6', label: 'robots built and demonstrated end to end' },
      { value: '2', label: 'inter-college competition podiums' },
    ],
    technologies: ['ESP32', 'ROS 2', 'Gazebo', 'Python', 'OpenCV', 'SolidWorks', 'PID control'],
    overview:
      '<p>The college had a robotics club on paper and a cupboard of unused components. Final-year students wanted portfolio projects; first-years wanted to learn the basics.</p>',
    challenge:
      '<p>Students had theory from coursework but had never closed a control loop on real hardware. Projects stalled at the wiring stage, and there was no structure to carry a build from idea to demo.</p>',
    approach:
      '<p>We ran our Phase 1 foundation on campus over weekends — embedded C/C++, sensors, PID, ROS 2 and SolidWorks — then split the club into six build teams, each with a mentor and a fixed demo date.</p>',
    solution:
      '<p>Teams built a self-balancing stepper robot, a 6-DOF Stewart platform, an autonomous maze solver and three line-following racers. Every build was simulated in Gazebo before parts were ordered.</p>',
    implementation:
      '<p>Weekly stand-ups, a shared parts tracker and two design reviews per team. The semester closed with a public demo day attended by faculty and visiting schools.</p>',
    testimonialText:
      'The difference was structure. Our students finally went from a datasheet to a robot that balances on its own, and they can explain every line of the control code.',
    testimonialName: 'Dr. Sameer Kulkarni (sample)',
    testimonialRole: 'Head of Mechatronics, Northbridge Institute of Technology',
    sortOrder: 2,
  },
  {
    title: 'Launching a franchise robotics centre in a tier-2 city',
    slug: 'franchise-robotics-centre-launch',
    client: 'BrightBots Learning Centre (sample franchise partner)',
    industry: 'Education Franchise',
    category: 'franchise-partners',
    serviceSlug: 'franchise-b2b',
    icon: 'building',
    excerpt:
      'Lab design, curriculum, instructor training and launch marketing for a new franchise partner — profitable batches running within the first quarter.',
    duration: '12 weeks to launch',
    results: [
      { value: '4', label: 'batches running by the end of month three' },
      { value: '92%', label: 'Phase 1 completion rate in the first cohort' },
      { value: '2', label: 'instructors certified on the XAI curriculum' },
    ],
    technologies: ['Arduino', 'ESP32', 'Raspberry Pi', '3D printing', 'Python', 'Lab management toolkit'],
    overview:
      '<p>An entrepreneur with a background in education wanted to open a robotics centre without building a curriculum or sourcing hardware from scratch.</p>',
    challenge:
      '<p>The partner needed a lab that looked professional on day one, instructors who could teach confidently, and a way to fill the first batches in a city where hands-on robotics was new to most parents.</p>',
    approach:
      '<p>We used our standard lab blueprint, adapted to a 900 sq ft commercial space, and ran instructor training at our own lab while the centre was being fitted out.</p>',
    solution:
      '<p>A turnkey lab with 12 workstations, the full Phase 1 curriculum and kit list, an instructor handbook, and a launch robot show for local schools.</p>',
    implementation:
      '<p>Fit-out in weeks one to six, instructor training in parallel, a free robot show and open lab tour in week ten, and the first paid batch in week twelve.</p>',
    testimonialText:
      'The launch robot show did more for enrolment than any advertisement. Parents saw a quadruped walk across the stage and the questions started immediately.',
    testimonialName: 'Neha Batra (sample)',
    testimonialRole: 'Founder, BrightBots Learning Centre',
    sortOrder: 3,
  },
  {
    title: 'A vision-guided sorting demonstrator for an industry partner',
    slug: 'vision-guided-sorting-demonstrator',
    client: 'Arcline Automation (sample industry partner)',
    industry: 'Industrial Automation',
    category: 'industry-partners',
    serviceSlug: 'rnd-lab',
    icon: 'factory',
    excerpt:
      'Our Phase 3 R&D students built a low-cost robotic arm that sorts parts by colour and shape using OpenCV — now used at trade shows to explain machine vision.',
    duration: '10 weeks',
    results: [
      { value: '95%', label: 'sorting accuracy on the demo parts set' },
      { value: '₹60k', label: 'bill of materials, versus a commercial demo cell' },
      { value: '3', label: 'students placed as interns with the partner' },
    ],
    technologies: ['OpenCV', 'Python', 'ROS 2', 'Raspberry Pi 5', 'Servo-driven 4-DOF arm', 'SolidWorks'],
    overview:
      '<p>Arcline needed a portable demonstrator that shows how a camera and a robot arm work together, without shipping an industrial cell to every exhibition.</p>',
    challenge:
      '<p>The demonstrator had to be reliable under trade-show lighting, run for eight hours a day, and be simple enough for the sales team to set up without an engineer.</p>',
    approach:
      '<p>A three-student R&D team scoped the problem with the partner, simulated the arm in Gazebo, and iterated on the vision pipeline with photographs taken at a real exhibition hall.</p>',
    solution:
      '<p>A 4-DOF arm with a Raspberry Pi running an OpenCV pipeline under ROS 2, a diffused LED light box to tame variable lighting, and a one-button start-up script.</p>',
    implementation:
      '<p>Two design reviews with the partner, a week of soak testing in our lab, and a handover session with the sales team before its first exhibition.</p>',
    testimonialText:
      'It is the most-photographed thing on our stand. The students treated it like a product, not a project, and it has run every day of every show.',
    testimonialName: 'Vikram Rao (sample)',
    testimonialRole: 'Product Manager, Arcline Automation',
    sortOrder: 4,
  },
] as const

const PORTFOLIO = [
  {
    title: 'Self-balancing stepper robot',
    slug: 'self-balancing-stepper-robot',
    category: 'balancing-control',
    summary:
      'A two-wheeled robot that stays upright using an IMU, stepper motors and a tuned PID loop — the classic control-systems build from Phase 2.',
    description:
      '<p>Students design the chassis in SolidWorks, read a 6-axis IMU over I²C, fuse the readings with a complementary filter and close a PID loop that drives two stepper motors.</p><ul><li>Real-time control on an ESP32 with FreeRTOS</li><li>Live PID tuning over Wi-Fi from a phone</li><li>Remote driving once it balances</li></ul>',
    technologies: ['ESP32', 'MPU6050 IMU', 'Stepper motors', 'PID', 'FreeRTOS', 'SolidWorks'],
    results: [
      { value: '< 2°', label: 'tilt held while standing still' },
      { value: '6 weeks', label: 'from first CAD sketch to balancing' },
    ],
    team: ['Student build team', 'XAI mentor'],
    duration: '6 weeks',
    icon: 'gauge',
    featured: true,
    caseStudySlug: 'engineering-college-robotics-club',
    sortOrder: 1,
  },
  {
    title: '6-DOF Stewart platform',
    slug: '6-dof-stewart-platform',
    category: 'robotic-arms',
    summary:
      'Six servo-driven legs move a top plate in all six degrees of freedom — used to balance a ball and to demonstrate inverse kinematics.',
    description:
      '<p>The Stewart platform is our favourite build for teaching inverse kinematics. Students derive the leg lengths for a target pose, then add a resistive touch panel so the platform can balance a ball on its own.</p>',
    technologies: ['Arduino Mega', 'Servo motors', 'Inverse kinematics', 'Python', 'Touch panel', 'PID'],
    results: [
      { value: '6', label: 'degrees of freedom controlled in real time' },
      { value: '50 Hz', label: 'control loop for ball balancing' },
    ],
    team: ['Student build team', 'XAI mentor'],
    duration: '7 weeks',
    icon: 'target',
    featured: true,
    caseStudySlug: null,
    sortOrder: 2,
  },
  {
    title: 'Autonomous maze solver',
    slug: 'autonomous-maze-solver',
    category: 'mobile-robots',
    summary:
      'A compact rover that maps an unknown maze with distance sensors, finds the shortest path with flood-fill, then runs it at speed.',
    description:
      '<p>Built to micromouse-style rules: the robot explores, builds a map in memory, computes the shortest route and makes a timed fast run. Students learn encoders, sensor fusion and graph search in one build.</p>',
    technologies: ['ESP32', 'ToF distance sensors', 'Wheel encoders', 'Flood-fill algorithm', 'C++'],
    results: [
      { value: '16×16', label: 'maze mapped autonomously' },
      { value: '3×', label: 'faster on the fast run than the search run' },
    ],
    team: ['Student build team', 'XAI mentor'],
    duration: '6 weeks',
    icon: 'compass',
    featured: false,
    caseStudySlug: 'engineering-college-robotics-club',
    sortOrder: 3,
  },
  {
    title: '8-DOF quadruped spider robot',
    slug: '8-dof-quadruped-spider-robot',
    category: 'legged-robots',
    summary:
      'A four-legged walking robot with two joints per leg, programmed with creep and trot gaits and controlled from a phone.',
    description:
      '<p>Students 3D-print the body and legs, calibrate eight servos and write gait tables before moving on to a simple kinematic model for smoother walking. It is the crowd favourite at every robot show.</p>',
    technologies: ['ESP32', '8 × MG90S servos', '3D printing', 'Gait planning', 'Bluetooth control'],
    results: [
      { value: '2', label: 'gaits: creep and trot' },
      { value: '8', label: 'servos coordinated per step' },
    ],
    team: ['Student build team', 'XAI mentor'],
    duration: '5 weeks',
    icon: 'bot',
    featured: false,
    caseStudySlug: null,
    sortOrder: 4,
  },
  {
    title: 'Vision-guided sorting arm',
    slug: 'vision-guided-sorting-arm',
    category: 'robotic-arms',
    summary:
      'A 4-DOF arm that picks parts from a tray and sorts them by colour and shape using OpenCV — built in our Phase 3 R&D incubation.',
    description:
      '<p>A camera above the tray detects each part, a ROS 2 node converts its position into arm coordinates, and the arm places it in the matching bin. Built as a trade-show demonstrator for an industry partner.</p>',
    technologies: ['Raspberry Pi 5', 'OpenCV', 'ROS 2', 'Python', 'SolidWorks'],
    results: [
      { value: '95%', label: 'sorting accuracy on the demo set' },
      { value: '8 h', label: 'continuous running at exhibitions' },
    ],
    team: ['Phase 3 R&D team (3 students)', 'XAI mentor'],
    duration: '10 weeks',
    icon: 'flask',
    featured: false,
    caseStudySlug: 'vision-guided-sorting-demonstrator',
    sortOrder: 5,
  },
  {
    title: 'Line-following swarm racers',
    slug: 'line-following-swarm-racers',
    category: 'swarm-autonomy',
    summary:
      'Five small rovers that follow a track and keep their distance from each other over ESP-NOW — a first taste of multi-robot coordination.',
    description:
      '<p>Each racer follows a line with an IR array and broadcasts its position to the others. Students tune a simple following-distance controller so the swarm moves like a convoy without collisions.</p>',
    technologies: ['ESP32', 'ESP-NOW', 'IR sensor array', 'PID', 'C/C++'],
    results: [
      { value: '5', label: 'robots coordinating without a central controller' },
      { value: '0', label: 'collisions in the final demo run' },
    ],
    team: ['School robotics club', 'XAI instructor'],
    duration: '4 weeks',
    icon: 'signal',
    featured: false,
    caseStudySlug: null,
    sortOrder: 6,
  },
] as const

const BLOGS = [
  {
    title: 'Tuning PID for a self-balancing robot, step by step',
    slug: 'tuning-pid-self-balancing-robot',
    category: 'robotics-engineering',
    relatedService: 'robotics-programme',
    tags: ['PID', 'Control systems', 'ESP32'],
    excerpt:
      'Proportional, integral, derivative — what each term actually does to a robot that is trying not to fall over, and the order we tune them in the lab.',
    body: `<h2>Why balancing robots are the perfect PID teacher</h2>
<p>A self-balancing robot falls over in well under a second if the controller is wrong. That makes every change you make to the gains immediately visible, which is exactly what you want when you are learning control.</p>
<h2>The order we tune in</h2>
<ul>
<li><strong>P first.</strong> Raise it until the robot starts to oscillate around upright, then back off a little.</li>
<li><strong>D next.</strong> Add derivative to damp the oscillation. Too much and the motors buzz.</li>
<li><strong>I last.</strong> A small integral term removes the slow drift caused by an off-centre battery.</li>
</ul>
<h2>Common mistakes</h2>
<p>Most failed builds we see are not tuning problems at all: a loose IMU mount, a loop that runs at an irregular rate, or a complementary filter with the wrong time constant. Fix the mechanics and timing before touching the gains.</p>`,
    daysAgo: 4,
  },
  {
    title: 'ESP32 or Arduino Uno: which board should a beginner start with?',
    slug: 'esp32-vs-arduino-uno-for-beginners',
    category: 'embedded-systems',
    relatedService: 'robotics-programme',
    tags: ['ESP32', 'Arduino', 'Beginners'],
    excerpt:
      'Both boards are excellent. Here is how we decide which one a new student uses first, and why most of our builds end up on the ESP32.',
    body: `<h2>Start simple</h2>
<p>The Arduino Uno is forgiving: 5 V logic, a huge library ecosystem and almost nothing to configure. For a student's first blinking LED and first sensor, it is hard to beat.</p>
<h2>When to move to the ESP32</h2>
<ul>
<li>You need Wi-Fi or Bluetooth — remote control, live telemetry, PID tuning from a phone.</li>
<li>You need more speed or memory for a control loop or a small map.</li>
<li>You want to learn FreeRTOS and run several tasks at once.</li>
</ul>
<h2>Our recommendation</h2>
<p>In Phase 1 students meet both. They start on the Uno for the fundamentals and move to the ESP32 within a few weeks, which is the board almost every Phase 2 project uses.</p>`,
    daysAgo: 12,
  },
  {
    title: 'Getting started with OpenCV for robot vision',
    slug: 'getting-started-opencv-robot-vision',
    category: 'ai-computer-vision',
    relatedService: 'rnd-lab',
    tags: ['OpenCV', 'Python', 'Computer vision'],
    excerpt:
      'Colour thresholds, contours and a little geometry are enough to make a robot see. A practical first pipeline in Python.',
    body: `<h2>The smallest useful pipeline</h2>
<p>Most robot vision tasks in our lab start with the same four steps: capture a frame, convert it to HSV, threshold for a colour, and find contours. With those you can track a ball, follow a coloured line or locate a part on a tray.</p>
<h2>What trips people up</h2>
<ul>
<li>Lighting. A threshold tuned at noon fails at 6 pm — use a light box or adaptive thresholds.</li>
<li>Camera latency. Measure it before you blame your control loop.</li>
<li>Coordinate frames. Pixels are not millimetres; calibrate once and write it down.</li>
</ul>
<h2>Where it leads</h2>
<p>Students who enjoy this go on to our sorting-arm and line-following projects, and some take it further in Phase 3 R&amp;D with object detection models.</p>`,
    daysAgo: 21,
  },
  {
    title: 'Simulate before you solder: ROS 2 and Gazebo for student projects',
    slug: 'ros-2-gazebo-for-student-projects',
    category: 'ros-simulation',
    relatedService: 'robotics-programme',
    tags: ['ROS 2', 'Gazebo', 'Simulation'],
    excerpt:
      'Why every Phase 2 build at XAI Robotics starts in simulation, and the minimum ROS 2 you need to get a robot moving in Gazebo.',
    body: `<h2>Simulation saves parts and weeks</h2>
<p>A burnt motor driver costs money and a week of waiting for a replacement. A crashed simulation costs a restart. Testing control logic in Gazebo first means the hardware build starts from code that already works.</p>
<h2>The minimum ROS 2 you need</h2>
<ul>
<li>Nodes, topics and messages — the publish/subscribe model.</li>
<li>A URDF that describes your robot's links and joints.</li>
<li>A launch file that starts the simulation and your controller together.</li>
</ul>
<h2>From simulation to hardware</h2>
<p>Because the same ROS 2 topics drive both the simulated and the real robot, moving to hardware is mostly a matter of swapping one node. That is the habit we want students to leave with.</p>`,
    daysAgo: 33,
  },
  {
    title: 'From first LED to walking quadruped: one student’s six months',
    slug: 'from-first-led-to-walking-quadruped',
    category: 'student-projects',
    relatedService: 'robotics-projects',
    tags: ['Student stories', 'Quadruped', 'Programme'],
    excerpt:
      'A look at how a Class 11 student with no electronics background went through all three phases of the programme and built an 8-DOF spider robot.',
    body: `<h2>Phase 1: the foundation</h2>
<p>The first month was all fundamentals: Ohm's law, breadboards, reading a datasheet and writing C++ for an Arduino. By week eight our student was reading an IMU and plotting the data live.</p>
<h2>Phase 2: the build</h2>
<p>Choosing the 8-DOF quadruped meant learning 3D printing, servo calibration and gait tables. The first steps were wobbly; the final demo walked across the stage at our robot show.</p>
<ul>
<li>Week 1–2: CAD and printing</li>
<li>Week 3–4: servo calibration and a creep gait</li>
<li>Week 5: trot gait and phone control</li>
</ul>
<h2>Phase 3: what comes next</h2>
<p>The project is now in R&amp;D incubation, with a camera and obstacle detection being added. (This post is sample content written for the demo site.)</p>`,
    daysAgo: 47,
  },
  {
    title: 'What happens at an XAI Robotics school workshop',
    slug: 'what-happens-at-a-school-robotics-workshop',
    category: 'events-workshops',
    relatedService: 'workshops-events',
    tags: ['Workshops', 'Schools', 'Robot show'],
    excerpt:
      'Two hours, thirty students and a box of parts: how our school workshops are structured, and what students take home.',
    body: `<h2>The format</h2>
<p>Every workshop opens with a short robot show — a balancing robot, a Stewart platform, a walking quadruped — so students see where the skills lead before they pick up a screwdriver.</p>
<h2>The hands-on part</h2>
<ul>
<li>Teams of three wire an obstacle-avoiding car from a kit.</li>
<li>They upload code, test it, and change one thing to make it their own.</li>
<li>The session ends with a race on a taped-out track.</li>
</ul>
<h2>Booking one</h2>
<p>Workshops run for Classes 5–12 and for first-year college students. Schools that want something longer can move on to a permanent lab setup with our team.</p>`,
    daysAgo: 60,
  },
] as const

const TESTIMONIALS = [
  {
    name: 'Aarav Mehta',
    role: 'Programme graduate, Batch 2025',
    company: null,
    quote:
      'I joined knowing nothing about electronics. Six months later I had built a self-balancing robot and could explain every line of its control code in my college interview.',
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    name: 'Sunita Kapoor',
    role: 'Parent',
    company: null,
    quote:
      'My daughter used to spend weekends on her phone. Now she spends them in the lab, and comes home talking about PID loops and servo calibration. The mentors are patient and genuinely invested.',
    rating: 5,
    featured: true,
    order: 2,
  },
  {
    name: 'Rajeev Sharma',
    role: 'Principal, partner school',
    company: 'Riverside Convent School (sample)',
    quote:
      'XAI set up our robotics lab and trained our teachers. Within one term our students were presenting working robots at the annual exhibition.',
    rating: null,
    featured: true,
    order: 3,
  },
  {
    name: 'Kavya Iyer',
    role: 'Programme graduate, Batch 2024',
    company: null,
    quote:
      'The Phase 3 R&D incubation was the best part. We built a vision-guided sorting arm for a real company, and it led straight to my internship.',
    rating: 5,
    featured: false,
    order: 4,
  },
  {
    name: 'Harpreet Singh',
    role: 'Franchise partner',
    company: 'RoboNest Learning Centre (sample)',
    quote:
      'The lab blueprint, curriculum and instructor training meant we opened with confidence. Our first four batches filled within three months.',
    rating: 4,
    featured: false,
    order: 5,
  },
  {
    name: 'Ishaan Verma',
    role: 'Workshop participant, Class 9',
    company: null,
    quote:
      'The robot show at our school was amazing, and building my own obstacle-avoiding car in the workshop made me want to join the full programme.',
    rating: 5,
    featured: false,
    order: 6,
  },
] as const

/* ------------------------------------------------------------------ */
/* Seeding                                                              */
/* ------------------------------------------------------------------ */

async function exists(table: string, column: string, value: string): Promise<string | undefined> {
  const row = await queryOne<Row>(`SELECT id FROM ${table} WHERE ${column} = ? LIMIT 1`, [value])
  return (row?.id as string | undefined) ?? undefined
}

/** Stamps ownership the way the audit middleware would for a signed-in save. */
async function stampOwner(table: string, id: string, userId: string | null): Promise<void> {
  if (!userId) return
  await execute(`UPDATE ${table} SET created_by = ?, updated_by = ? WHERE id = ?`, [userId, userId, id])
}

const idOf = (record: unknown): string => (record as { id: string }).id

async function seedDemo(): Promise<void> {
  const admin = await queryOne<Row>(
    "SELECT id, name FROM users WHERE role = 'admin' AND active = 1 ORDER BY created_at ASC LIMIT 1",
  )
  const adminId = (admin?.id as string | undefined) ?? null
  console.log(adminId ? `Author / owner: ${String(admin?.name)}` : 'No admin user found — posts will have no author.')

  const counts = { created: 0, skipped: 0 }
  const skip = (what: string) => {
    counts.skipped += 1
    console.log(`  skip   ${what} (already exists)`)
  }
  const made = (what: string) => {
    counts.created += 1
    console.log(`  create ${what}`)
  }

  console.log('\nCase studies')
  for (const study of CASE_STUDIES) {
    if (await exists('case_studies', 'slug', study.slug)) {
      skip(study.slug)
      continue
    }
    const created = await caseStudiesRepo.create(
      caseStudySchema.parse({ ...study, results: [...study.results], technologies: [...study.technologies], status: 'published' }),
    )
    await stampOwner('case_studies', idOf(created), adminId)
    made(study.slug)
  }

  console.log('\nPortfolio')
  for (const item of PORTFOLIO) {
    if (await exists('portfolio', 'slug', item.slug)) {
      skip(item.slug)
      continue
    }
    const { caseStudySlug, ...fields } = item
    const caseStudyId = caseStudySlug ? await exists('case_studies', 'slug', caseStudySlug) : undefined
    const created = await portfolioRepo.create(
      portfolioSchema.parse({
        ...fields,
        technologies: [...fields.technologies],
        results: [...fields.results],
        team: [...fields.team],
        caseStudyId,
        state: 'active',
        status: 'published',
      }),
    )
    await stampOwner('portfolio', idOf(created), adminId)
    made(item.slug)
  }

  console.log('\nBlog posts')
  for (const post of BLOGS) {
    if (await exists('blogs', 'slug', post.slug)) {
      skip(post.slug)
      continue
    }
    const { daysAgo, ...fields } = post
    // An empty fallback author is written as NULL (see blogs.repo create).
    const created = await blogsRepo.create(
      blogSchema.parse({ ...fields, tags: [...fields.tags], status: 'published' }),
      adminId ?? '',
    )
    const id = idOf(created)
    // Spread the dates out so the blog reads like one written over time.
    await execute(
      `UPDATE blogs
          SET published_at = NOW(3) - INTERVAL ? DAY, publish_at = NOW(3) - INTERVAL ? DAY,
              created_at = NOW(3) - INTERVAL ? DAY
        WHERE id = ?`,
      [daysAgo, daysAgo, daysAgo, id],
    )
    await stampOwner('blogs', id, adminId)
    made(post.slug)
  }

  console.log('\nTestimonials')
  for (const testimonial of TESTIMONIALS) {
    if (await exists('testimonials', 'name', testimonial.name)) {
      skip(testimonial.name)
      continue
    }
    const created = await testimonialsRepo.create(
      testimonialSchema.parse({
        ...testimonial,
        company: testimonial.company ?? undefined,
        status: 'published',
      }),
    )
    await stampOwner('testimonials', idOf(created), adminId)
    made(testimonial.name)
  }

  console.log(`\nDone: ${counts.created} created, ${counts.skipped} skipped.`)
}

seedDemo()
  .catch((error: unknown) => {
    console.error('Demo seed failed:', error instanceof Error ? error.message : error)
    if (error && typeof error === 'object' && 'fieldErrors' in error) {
      console.error((error as { fieldErrors: unknown }).fieldErrors)
    }
    process.exitCode = 1
  })
  .finally(() => pool.end())
