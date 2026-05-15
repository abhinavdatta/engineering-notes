/**
 * ============================================================
 * CALCULATOR.JS - Marks Calculator Logic
 * ============================================================
 */

// Grade point mapping
const GRADE_POINTS = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'F': 0
};

// Grade targets
const GRADE_TARGETS = [
  { label: 'Ex (Outstanding)', target: 90, color: 'purple' },
  { label: 'A+ (Excellent)', target: 80, color: 'emerald' },
  { label: 'A (Very Good)', target: 70, color: 'blue' },
  { label: 'B+ (Good)', target: 60, color: 'amber' },
  { label: 'B (Above Avg)', target: 55, color: 'orange' },
  { label: 'C (Average)', target: 50, color: 'zinc' }
];

// Subject counter for unique IDs
let subjectCounter = 0;

// ============================================================
// INTERNAL MARKS CALCULATOR
// ============================================================
function calculateInternals() {
  const ct1 = parseFloat(document.getElementById('ct1').value) || 0;
  const ct2 = parseFloat(document.getElementById('ct2').value) || 0;
  const s1 = parseFloat(document.getElementById('sessional1').value) || 0;
  const s2 = parseFloat(document.getElementById('sessional2').value) || 0;
  const assign = parseFloat(document.getElementById('assignment').value) || 0;

  // Formula: 2/3 * max + 1/3 * min
  const testTotal = Math.round((2/3) * Math.max(ct1, ct2) + (1/3) * Math.min(ct1, ct2));
  const sessionalTotal = Math.round((2/3) * Math.max(s1, s2) + (1/3) * Math.min(s1, s2));

  // Update progress bars
  updateProgressBar('ct', testTotal, 10);
  updateProgressBar('sessional', sessionalTotal, 20);
  updateProgressBar('assign', assign, 10);

  // Calculate total
  let total = testTotal + sessionalTotal + assign;
  if (total > 40) total = 40;

  // Update total display
  document.getElementById('totalInternals').textContent = total;
  document.getElementById('totalFill').style.width = `${(total / 40) * 100}%`;

  // Update grade cards and simulator
  updateGradeCards(total);
  updateSimulator();
}

// Update progress bar visuals
function updateProgressBar(type, value, max) {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Update fill
  const fill = document.getElementById(`${type}Fill`);
  if (fill) {
    fill.style.width = `${percentage}%`;
  }
  
  // Update pointer position
  const pointer = document.getElementById(`${type}Pointer`);
  if (pointer) {
    pointer.style.left = `${percentage}%`;
  }
  
  // Update pointer value
  const pointerValue = document.getElementById(`${type}PointerValue`);
  if (pointerValue) {
    pointerValue.textContent = value;
  }
  
  // Update display text
  const display = document.getElementById(`${type}Display`);
  if (display) {
    display.textContent = `${value} / ${max}`;
  }
}

// ============================================================
// GRADE CARDS
// ============================================================
function generateGradeCards() {
  const container = document.getElementById('gradeCards');
  container.innerHTML = '';

  GRADE_TARGETS.forEach(grade => {
    const card = document.createElement('div');
    card.className = `grade-card ${grade.color}`;
    card.id = `grade-${grade.color}`;
    card.innerHTML = `
      <div class="grade-card-header">
        <span class="grade-card-label">${grade.label}</span>
        <span class="grade-card-target">${grade.target}%</span>
      </div>
      <div class="grade-card-marks" id="marks-${grade.color}">0 <small>/ 100</small></div>
      <div class="grade-card-status" id="status-${grade.color}">Required in End Sem</div>
    `;
    container.appendChild(card);
  });
}

function updateGradeCards(totalInternals) {
  GRADE_TARGETS.forEach(grade => {
    const required = Math.ceil((grade.target - totalInternals) / 0.6);
    const marksEl = document.getElementById(`marks-${grade.color}`);
    const statusEl = document.getElementById(`status-${grade.color}`);

    if (required > 100) {
      marksEl.innerHTML = '>100 <small>/ 100</small>';
      statusEl.innerHTML = '<span class="status-impossible">X Impossible</span>';
    } else if (required <= 0) {
      marksEl.innerHTML = '0 <small>/ 100</small>';
      statusEl.innerHTML = '<span class="status-secured">* Secured!</span>';
    } else {
      marksEl.innerHTML = `${required} <small>/ 100</small>`;
      if (required <= 35) {
        statusEl.innerHTML = '<span class="status-easy">Easy to achieve!</span>';
      } else {
        statusEl.innerHTML = '<span class="status-required">Required in End Sem</span>';
      }
    }
  });
}

// ============================================================
// SIMULATOR
// ============================================================

// Current external value
let externalValue = 60;

function setExternalValue(value) {
  externalValue = Math.max(0, Math.min(100, parseInt(value)));
  updateExternalBar();
  updateSimulator();
  
  // Update quick button active states
  document.querySelectorAll('.quick-btn').forEach(function(btn) {
    btn.classList.remove('active');
    if (parseInt(btn.textContent) === externalValue) {
      btn.classList.add('active');
    }
  });
}

function updateExternalBar() {
  const percentage = externalValue;
  
  // Update fill
  const fill = document.getElementById('externalFill');
  if (fill) {
    fill.style.width = `${percentage}%`;
  }
  
  // Update pointer position
  const pointer = document.getElementById('externalPointer');
  if (pointer) {
    pointer.style.left = `${percentage}%`;
  }
  
  // Update pointer value
  const pointerValue = document.getElementById('externalPointerValue');
  if (pointerValue) {
    pointerValue.textContent = externalValue;
  }
  
  // Update display text
  const display = document.getElementById('externalDisplay');
  if (display) {
    display.textContent = `${externalValue} / 100`;
  }
}

function updateSimulator() {
  const totalInternalsEl = document.getElementById('totalInternals');
  const totalInternals = parseInt(totalInternalsEl.textContent) || 0;

  // Calculate total
  const total = Math.round(totalInternals + 0.6 * externalValue);
  document.getElementById('totalMarks').textContent = total;

  // Get projected grade
  const grade = getProjectedGrade(total);
  const gradeEl = document.getElementById('projectedGrade');
  gradeEl.textContent = grade.grade;
  gradeEl.className = `grade-value ${grade.class}`;
}

// Handle click on progress bar track
function initExternalBarInteraction() {
  const track = document.getElementById('externalBarTrack');
  if (!track) return;
  
  track.addEventListener('click', function(e) {
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.round((clickX / rect.width) * 100);
    setExternalValue(percentage);
  });
}

function getProjectedGrade(total) {
  if (total >= 90) return { grade: 'Ex', class: 'grade-ex' };
  if (total >= 80) return { grade: 'A+', class: 'grade-ap' };
  if (total >= 70) return { grade: 'A', class: 'grade-a' };
  if (total >= 60) return { grade: 'B+', class: 'grade-bp' };
  if (total >= 55) return { grade: 'B', class: 'grade-b' };
  if (total >= 50) return { grade: 'C', class: 'grade-c' };
  return { grade: 'F', class: 'grade-f' };
}

// ============================================================
// SGPA CALCULATOR
// ============================================================
function initSubjects() {
  const list = document.getElementById('subjectsList');
  list.innerHTML = '';

  // Add 4 default subjects
  for (let i = 0; i < 4; i++) {
    addSubject();
  }
}

function addSubject() {
  subjectCounter++;
  const list = document.getElementById('subjectsList');

  const row = document.createElement('div');
  row.className = 'subject-row';
  row.id = `subject-${subjectCounter}`;
  row.innerHTML = `
    <input type="text" placeholder="Subject ${list.children.length + 1}" oninput="calculateSGPA()">
    <input type="number" value="3" min="1" max="10" oninput="calculateSGPA()">
    <select onchange="calculateSGPA()">
      <option value="10">O (10)</option>
      <option value="9" selected>A+ (9)</option>
      <option value="8">A (8)</option>
      <option value="7">B+ (7)</option>
      <option value="6">B (6)</option>
      <option value="5">C (5)</option>
      <option value="0">F (0)</option>
    </select>
    <button class="delete-btn" onclick="removeSubject('subject-${subjectCounter}')">X</button>
  `;
  list.appendChild(row);
  calculateSGPA();
}

function removeSubject(id) {
  const row = document.getElementById(id);
  if (row && document.querySelectorAll('.subject-row').length > 1) {
    row.remove();
    calculateSGPA();
  }
}

function calculateSGPA() {
  const rows = document.querySelectorAll('.subject-row');
  let totalCredits = 0;
  let totalPoints = 0;

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const select = row.querySelector('select');

    const credits = parseFloat(inputs[1].value) || 0;
    const gradePoint = parseFloat(select.value) || 0;

    if (credits > 0) {
      totalCredits += credits;
      totalPoints += credits * gradePoint;
    }
  });

  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  document.getElementById('sgpaValue').textContent = sgpa;
}

// ============================================================
// CGPA CALCULATOR
// ============================================================
function calculateCGPA() {
  let total = 0;
  let count = 0;

  for (let i = 1; i <= 8; i++) {
    const value = parseFloat(document.getElementById(`sem${i}`).value);
    if (!isNaN(value) && value > 0) {
      total += value;
      count++;
    }
  }

  const cgpa = count > 0 ? (total / count).toFixed(2) : '0.00';
  document.getElementById('cgpaValue').textContent = cgpa;
}

// ============================================================
// MOBILE MENU TOGGLE
// ============================================================
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('active');
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  generateGradeCards();
  initSubjects();
  initExternalBarInteraction();
  calculateInternals();
  updateExternalBar();
  updateSimulator();
});
