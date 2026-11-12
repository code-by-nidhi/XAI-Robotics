-- The XAI Robotics website's FAQ section, as it shipped.
--
-- The site reads /api/public/faqs and falls back to its built-in list only
-- when the CMS has no published questions. Seeding that list here means
-- editors start from what visitors already see, rather than the first FAQ
-- they add silently replacing the other eleven.
--
-- Filed under General (047 creates it; recreated here if it was removed).
-- Fixed ids and INSERT IGNORE keep this safe to run more than once.

INSERT IGNORE INTO faq_categories (id, name, slug, sort_order, active, created_at, updated_at)
VALUES (UUID(), 'General', 'general', 7, 1, NOW(3), NOW(3));

SET @general = (SELECT id FROM faq_categories WHERE slug = 'general');

INSERT IGNORE INTO faqs (id, question, answer, category_id, sort_order, featured, status, created_at, updated_at) VALUES
  ('9b534b0d-3186-5c2b-92c4-07111c2d55ab',
   'Who can join the programme?',
   'Students from Class 9 onwards, college students and early professionals who want to build real robots. Phase 1 starts from the fundamentals, so curiosity matters more than experience.',
   @general, 1, 0, 'published', NOW(3), NOW(3)),
  ('6468b3a0-5f41-593b-bf67-22c3b08b7bf9',
   'Do I need to know coding before I start?',
   'No. Phase 1 teaches C/C++ and Python for embedded systems from the basics. Prior coding experience helps you move faster.',
   @general, 2, 0, 'published', NOW(3), NOW(3)),
  ('c33e099b-5c65-5723-b2f6-f2e537acc05a',
   'Is the project kit included in the programme fee?',
   'The kit is purchased separately in Phase 2, and the finished robot is yours to keep.',
   @general, 3, 0, 'published', NOW(3), NOW(3)),
  ('534c07b0-e4c3-5fa6-8522-66d41bbd6f3e',
   'How do I choose my Phase 2 project?',
   'At the end of Phase 1, your mentor helps you pick one of the 12 projects based on your interests and skill level.',
   @general, 4, 0, 'published', NOW(3), NOW(3)),
  ('93ade1c8-aaed-5d63-8d87-71f2671eb976',
   'Is the R&D phase compulsory?',
   'No. Phase 3 is optional and designed for students who want to research and build their own idea. Approved projects receive components from our lab.',
   @general, 5, 0, 'published', NOW(3), NOW(3)),
  ('4982e6db-d441-5b30-b00d-ee540613788f',
   'Do you teach ROS, SolidWorks and OpenCV?',
   'Yes. Phase 1 includes dedicated modules on embedded systems with FreeRTOS, SolidWorks CAD, OpenCV computer vision and ROS 2 with Gazebo simulation, and you apply them in your Phase 2 project.',
   @general, 6, 0, 'published', NOW(3), NOW(3)),
  ('c10c0209-9f5b-5161-92ee-38a6d997041a',
   'Do I need to buy SolidWorks or other software?',
   'No. You practise in our lab during the programme. Most other tools we use, including ROS 2, OpenCV, KiCad and Python, are free and open source.',
   @general, 7, 0, 'published', NOW(3), NOW(3)),
  ('af543f58-d598-5569-ba2b-add5f2a1dc2a',
   'Can I learn robotics online?',
   'Phase 1 theory and programming can be followed in live online sessions. Building, testing and R&D need real hardware, so those phases take place in our robotics lab.',
   @general, 8, 0, 'published', NOW(3), NOW(3)),
  ('4c03c3fe-6168-587e-afb8-332bd9a65fff',
   'Is the lab safe for school students?',
   'Yes. Soldering, battery handling and power tools are always supervised by mentors, and safe-practice training is part of Module 01.',
   @general, 9, 0, 'published', NOW(3), NOW(3)),
  ('42599efc-39a4-5c6e-bca2-308eb9d4f02b',
   'Do I need my own laptop?',
   'A laptop helps you practise coding at home and keep your project files. Ask our team about lab system availability for your batch.',
   @general, 10, 0, 'published', NOW(3), NOW(3)),
  ('562c1ad5-9dd3-55f3-83a1-95df3fb350fe',
   'Can my school or college book a robotics workshop?',
   'Yes. We run robotics workshops, bootcamps and live demonstrations for schools, colleges and universities, and can set up a complete robotics lab through our franchise and B2B programme.',
   @general, 11, 0, 'published', NOW(3), NOW(3)),
  ('3c4bc7cf-e02b-5839-904e-3eb840b68bda',
   'Will I receive a certificate?',
   'Yes. Students who complete the programme receive an XAI Robotics certificate, along with a portfolio of their project work.',
   @general, 12, 0, 'published', NOW(3), NOW(3));
