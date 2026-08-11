const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- CLASSES ---
app.get('/api/classes', async (req, res) => {
  const classes = await prisma.class.findMany();
  res.json(classes);
});

app.post('/api/classes', async (req, res) => {
  const { id, name } = req.body;
  try {
    const newClass = await prisma.class.create({ data: { id, name } });
    res.json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- TEACHERS ---
app.get('/api/teachers', async (req, res) => {
  const teachers = await prisma.teacher.findMany();
  res.json(teachers);
});

app.post('/api/teachers', async (req, res) => {
  const { id, name } = req.body;
  try {
    const teacher = await prisma.teacher.create({ data: { id, name } });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- SUBJECTS ---
app.get('/api/subjects', async (req, res) => {
  const subjects = await prisma.subject.findMany();
  res.json(subjects);
});

app.post('/api/subjects', async (req, res) => {
  const { id, name } = req.body;
  try {
    const subject = await prisma.subject.create({ data: { id, name } });
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- STUDENTS ---
app.get('/api/students', async (req, res) => {
  const { classId } = req.query;
  const filter = classId ? { where: { classId } } : {};
  const students = await prisma.student.findMany(filter);
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  const { id, name, classId } = req.body;
  try {
    const student = await prisma.student.create({ data: { id, name, classId } });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- GRADES ---
app.get('/api/grades', async (req, res) => {
  const { classId, subjectId, teacherId, lm, component } = req.query;
  
  // Find all students in this class
  const students = await prisma.student.findMany({ where: { classId } });
  
  // Find grades for these filters
  const grades = await prisma.grade.findMany({
    where: { subjectId, teacherId, lm, component, studentId: { in: students.map(s => s.id) } }
  });

  // Map to format for frontend
  const result = students.map(student => {
    const grade = grades.find(g => g.studentId === student.id);
    return {
      id: student.id,
      name: student.name,
      score: grade ? grade.score : '',
      date: grade ? grade.date : ''
    };
  });

  res.json(result);
});

app.post('/api/grades', async (req, res) => {
  const { subjectId, teacherId, lm, component, date, grades } = req.body;
  
  // grades is an array of { studentId, score }
  try {
    for (const g of grades) {
      if (g.score !== '' && g.score !== null) {
        await prisma.grade.upsert({
          where: {
            studentId_subjectId_teacherId_lm_component: {
              studentId: g.studentId,
              subjectId,
              teacherId,
              lm,
              component
            }
          },
          update: { score: parseInt(g.score), date },
          create: {
            studentId: g.studentId,
            subjectId,
            teacherId,
            lm,
            component,
            score: parseInt(g.score),
            date
          }
        });
      }
    }
    res.json({ message: 'Grades saved successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- REPORTS ---
app.get('/api/reports/grades', async (req, res) => {
  const { classId, teacherId, startDate, endDate } = req.query;
  try {
    let gradeFilter = {};
    if (teacherId) gradeFilter.teacherId = teacherId;
    if (startDate && endDate) {
      gradeFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Fetch students based on classId if provided
    let studentFilter = {};
    if (classId) studentFilter.classId = classId;
    const students = await prisma.student.findMany({ where: studentFilter });
    const studentIds = students.map(s => s.id);
    
    // Add student filter to grades if classId was provided
    if (classId) {
      gradeFilter.studentId = { in: studentIds };
    }

    const grades = await prisma.grade.findMany({ where: gradeFilter });
    const subjects = await prisma.subject.findMany();
    const teachers = await prisma.teacher.findMany();
    const classes = await prisma.class.findMany();

    // Map relationships
    const reportData = grades.map(g => {
      const student = students.find(s => s.id === g.studentId);
      const subject = subjects.find(s => s.id === g.subjectId);
      const teacher = teachers.find(t => t.id === g.teacherId);
      const cls = student ? classes.find(c => c.id === student.classId) : null;

      return {
        ...g,
        studentName: student ? student.name : 'Unknown',
        className: cls ? cls.name : 'Unknown',
        subjectName: subject ? subject.name : 'Unknown',
        teacherName: teacher ? teacher.name : 'Unknown'
      };
    });

    res.json(reportData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
