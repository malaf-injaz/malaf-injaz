let editMode = false;
let currentSection = null;
let sectionData = JSON.parse(localStorage.getItem("sectionData")) || {};

function openSection(id) {
  currentSection = id;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("section-view").style.display = "block";
  renderSection();
}

function backToDashboard() {
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("section-view").style.display = "none";
  currentSection = null;
}

function toggleEditMode() {
  editMode = !editMode;
  showNotification(editMode ? "تم تفعيل وضع التعديل" : "تم إيقاف التعديل", "info");
  renderSection();
}

function saveCurrentSection() {
  if (currentSection !== null) {
    const content = document.getElementById("sectionText")?.value || "";
    sectionData[currentSection] = sectionData[currentSection] || {};
    sectionData[currentSection].text = content;

    localStorage.setItem("sectionData", JSON.stringify(sectionData));

    // إشعار الحفظ
    showNotification("تم الحفظ بنجاح ✅", "success");

    // إيقاف وضع التعديل تلقائيًا بعد الحفظ
    editMode = false;
    renderSection();

    // إشعار إضافي بعد التحويل إلى وضع القراءة
    setTimeout(() => {
      showNotification("تم حفظ البيانات والانتقال إلى وضع القراءة 🔒", "info");
    }, 800);
  }
}

function renderSection() {
  const container = document.getElementById("section-view");
  const data = sectionData[currentSection] || { text: "", files: [] };

  container.innerHTML = `
    <div class="section-header">
      <h2>القسم ${currentSection}</h2>
      ${editMode ? `<button class="btn btn-save" onclick="saveCurrentSection()"><i class="fas fa-save"></i> حفظ</button>` : ""}
    </div>

    <div class="section-content">
      ${editMode 
        ? `<textarea id="sectionText" class="section-text" placeholder="أدخل النص هنا...">${data.text}</textarea>` 
        : `<p>${data.text || "لا توجد بيانات بعد."}</p>`}

      <div class="upload-section" ${editMode ? "" : 'style="display:none;"'}>
        <input 
          type="file" 
          id="fileUpload" 
          multiple 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,video/*"
          style="display:none;"
        >
        <button class="btn btn-edit" onclick="document.getElementById('fileUpload').click()">
          <i class="fas fa-upload"></i> إضافة ملفات أو صور أو فيديو
        </button>
      </div>

      <div id="contentArea" class="file-gallery">
        ${data.files?.map((file, i) => `
          <div class="file-box">
            ${file.type.startsWith("image") 
              ? `<img src="${file.url}" class="preview-image">`
              : file.type.startsWith("video")
                ? `<video src="${file.url}" class="preview-video" controls></video>`
                : `<a href="${file.url}" class="file-link" target="_blank">${file.name}</a>`
            }
            ${editMode ? `<button class="delete-file-btn" onclick="deleteFile(${i})">×</button>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const fileInput = document.getElementById("fileUpload");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileUpload);
  }
  // ✅ إظهار أو إخفاء الأزرار السفلية حسب وضع التعديل
const bottomEditBtn = document.querySelector(".section-footer .btn-edit");
const bottomSaveBtn = document.querySelector(".section-footer .btn-save");

if (editMode) {
  if (bottomEditBtn) bottomEditBtn.style.display = "inline-block";
  if (bottomSaveBtn) bottomSaveBtn.style.display = "inline-block";
} else {
  if (bottomEditBtn) bottomEditBtn.style.display = "none";
  if (bottomSaveBtn) bottomSaveBtn.style.display = "none";
}

}

function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];

  if (!sectionData[currentSection]) sectionData[currentSection] = { text: "", files: [] };

  files.forEach(file => {
    if (validTypes.includes(file.type) || file.type.startsWith("image") || file.type.startsWith("video")) {
      const reader = new FileReader();
      reader.onload = e => {
        sectionData[currentSection].files.push({
          name: file.name,
          url: e.target.result,
          type: file.type
        });
        localStorage.setItem("sectionData", JSON.stringify(sectionData));
        renderSection();
      };
      reader.readAsDataURL(file);
    } else {
      showNotification("الملف غير مدعوم", "warn");
    }
  });
}

function deleteFile(index) {
  if (confirm("هل تريد حذف هذا الملف؟")) {
    sectionData[currentSection].files.splice(index, 1);
    localStorage.setItem("sectionData", JSON.stringify(sectionData));
    renderSection();
  }
}

function showNotification(message, type = "info") {
  const note = document.createElement("div");
  note.className = `notify ${type}`;
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 2500);
}
// ✅ التحكم في ظهور الأزرار السفلية حسب وضع التعديل دون التأثير على التصميم
document.addEventListener("DOMContentLoaded", () => {
  function updateFooterButtons() {
    const bottomEditBtn = document.querySelector(".section-footer .btn-edit");
    const bottomSaveBtn = document.querySelector(".section-footer .btn-save");
    
    // تأكد من وجود الزرين قبل التعديل
    if (!bottomEditBtn || !bottomSaveBtn) return;

    if (window.editMode === true) {
      bottomEditBtn.style.display = "inline-block";
      bottomSaveBtn.style.display = "inline-block";
    } else {
      bottomEditBtn.style.display = "none";
      bottomSaveBtn.style.display = "none";
    }
  }

  // تحديث حالة الأزرار عند أي تغيير في وضع التعديل أو الحفظ
  const originalToggleEditMode = window.toggleEditMode;
  window.toggleEditMode = function() {
    originalToggleEditMode.apply(this, arguments);
    updateFooterButtons();
  };

  const originalSave = window.saveCurrentSection;
  window.saveCurrentSection = function() {
    originalSave.apply(this, arguments);
    window.editMode = false; // إيقاف التعديل بعد الحفظ
    updateFooterButtons();
  };

// تأثير ظهور لوحة التحكم عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
  const dashboardHeader = document.querySelector(".dashboard-header");
  if (dashboardHeader) {
    setTimeout(() => {
      dashboardHeader.classList.add("visible");
    }, 200); // بعد 0.2 ثانية من تحميل الصفحة
  }
});
  // تهيئة أولية عند فتح الصفحة
  updateFooterButtons();
});
// ===============================
// ✅ نظام النقاط التفاعلية (أحمر ↔ أخضر)
// ===============================

function updateStatusDots() {
  const cards = document.querySelectorAll(".dashboard-card");
  const stored = JSON.parse(localStorage.getItem("sectionData")) || {};

  cards.forEach((card, index) => {
    // التأكد من وجود النقطة داخل البطاقة
    let dot = card.querySelector(".status-dot");
    if (!dot) {
      dot = document.createElement("span");
      dot.className = "status-dot";
      card.appendChild(dot);
    }

    // تحديد رقم القسم (تسلسل البطاقات)
    const sectionNumber = index + 1;
    const section = stored[sectionNumber];

    // 🔸 التحقق من وجود بيانات فعلية في القسم
    const hasData =
      section &&
      (
        (section.text && section.text.trim() !== "") ||
        (section.files && Array.isArray(section.files) && section.files.length > 0)
      );

    // 🔹 تغيير اللون حسب الحالة
    if (hasData) {
      dot.classList.add("active");   // 🟢 بيانات موجودة
    } else {
      dot.classList.remove("active"); // 🔴 لا بيانات
    }
  });
}

// ✅ تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", updateStatusDots);

// ✅ تحديث بعد كل عملية حفظ
const originalSaveCurrentSection =
  typeof saveCurrentSection === "function" ? saveCurrentSection : null;

window.saveCurrentSection = function() {
  if (originalSaveCurrentSection) originalSaveCurrentSection();
  updateStatusDots(); // تحديث فوري بدون تأخير
};
// ✅ إنشاء حاوية الأزرار بشكل منسق أسفل النص
function addLinkButtonsContainer() {
  // إزالة أي حاوية سابقة لتجنب التكرار
  const oldBox = document.getElementById("links-box");
  if (oldBox) oldBox.remove();

  // إنشاء الصندوق الرئيسي
  const box = document.createElement("div");
  box.id = "links-box";
  box.style.marginTop = "25px";
  box.style.padding = "15px";
  box.style.background = "#f8f9fa";
  box.style.border = "2px solid #e0e0e0";
  box.style.borderRadius = "15px";
  box.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
  box.style.textAlign = "center";

  const content = document.querySelector(".section-content");
  if (content) content.appendChild(box);
  return box;
}

// ✅ إنشاء أزرار مجلدات الأقسام (من 1 إلى 19)
(function setupAllSectionFolderButtons() {
  // خريطة الروابط — أضف روابطك هنا لاحقًا
  const sectionLinks = {
    1: "https://drive.google.com/drive/folders/14LzNaV4HCrT9eeDU6f4fPEFO_8MDUBT-?usp=sharing",
    2: "https://drive.google.com/drive/folders/1V6Opj3x5AkO2sY7kn9YWY1kPh0-TTmAV?usp=sharing",
    3: "https://drive.google.com/drive/folders/15kbRqYQa3cuXc-xchhAoFbyKWY60xTYL?usp=drive_link",
    4: "https://drive.google.com/drive/folders/1a1FrKRzUktWkcYdsD-nk-szbWi4XXID7?usp=drive_link",
    5: "https://drive.google.com/drive/folders/1BH_x51F7LCLHQX5bZIj7lFjg8H474r5b?usp=drive_link",
    6: "https://drive.google.com/drive/folders/18Vqnj8LfytN1R7H6hkjpRi0vkLUSnQFs?usp=drive_link",
    7: "https://drive.google.com/drive/folders/1KDESC0xy_eTVOD_kREN80NAv9RXx6jP4?usp=drive_link",
    8: "https://drive.google.com/drive/folders/1PCTwtTOAdqGaRAt-e0BK_gP59SR2MnKN?usp=drive_link",
    9: "https://drive.google.com/drive/folders/1pmnZ8SriVWls6jA3Uq0s-x6jrhpDDNnh?usp=drive_link",
    10: "https://drive.google.com/drive/folders/1QhZIDulJaSagVP9yi1Bjc8VtlZAuSPb2?usp=drive_link",
    11: "https://drive.google.com/drive/folders/1WobkK3QhJk7pRHePRZ8IbOlJzqOMWM8q?usp=drive_link",
    12: "https://drive.google.com/drive/folders/1NDsGjmTu7d6iSIr-ajgjBm8nL2gFo76a?usp=drive_link",
    13: "https://drive.google.com/drive/folders/1zAzePtXMGV6R24vZFZ82bfqqZZs5Ojx6?usp=drive_link",
    14: "https://drive.google.com/drive/folders/1tXwXWU2Qw0f3oFYEoL-Pl9zjHQoGG-qI?usp=drive_link",
    15: "https://drive.google.com/drive/folders/1d5CqoSx1sDq5rKAamTenUk7go6aWDLuv?usp=drive_link",
    16: "https://drive.google.com/drive/folders/1Tbo-618ZY-8DWfBmZ6TAt3jcKdoEDWz_?usp=drive_link",
    17: "https://drive.google.com/drive/folders/1fdg2SIyRyn7pYTEXeFo69X7l-_QWx4Xe?usp=drive_link",
    18: "https://drive.google.com/drive/folders/1-4TDwBVIjcrtYcMB_n9Fb-SbxIfSzzlx?usp=drive_link",
    19: "https://drive.google.com/drive/folders/1lsJDF7DceutBCzz6wE42MB8ChRDaorTX?usp=drive_link",
  };

  // ألوان مميزة للأقسام (تكرارية كل 3)
  const colors = ["#28a745", "#007bff", "#ffc107"];

  function addSectionFolderButton() {
    const header = document.querySelector(".section-header");
    if (!header) return;

    // إزالة أي زر سابق لتجنب التكرار
    const oldBtn = header.querySelector("#section-folder-btn");
    if (oldBtn) oldBtn.remove();

    const sec = Number(currentSection);
    const link = sectionLinks[sec];
    if (!link || link.trim() === "") return; // لا زر بدون رابط

    const btn = document.createElement("button");
    btn.id = "section-folder-btn";
    btn.textContent = `📁 مجلد القسم ${sec}`;
    btn.className = "btn btn-link";
    btn.style.background = colors[(sec - 1) % 3];
    btn.style.color = sec % 3 === 0 ? "#000" : "#fff";
    btn.style.marginRight = "10px";
    btn.style.padding = "8px 16px";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.onclick = () => window.open(link, "_blank");

    header.appendChild(btn);
  }

  // دمج الزر في النظام بعد كل فتح قسم
  const originalRenderSection = window.renderSection;
  window.renderSection = function () {
    originalRenderSection.apply(this, arguments);
    addSectionFolderButton();
  };
})();
// ===============================
// 📄 زر PDF + 🖨️ زر الطباعة بجانب زر مجلد القسم
// ===============================

// ✅ تحميل مكتبة jsPDF تلقائيًا
function ensureJsPDFLoaded(callback) {
  if (window.jspdf && window.jspdf.jsPDF) {
    callback();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }
}

// ✅ دالة لإضافة الأزرار الثلاثة في الصف العلوي داخل صفحة القراءة
function addTopButtons() {
  const container = document.querySelector(".section-header");
  if (!container || document.getElementById("pdf-btn")) return;

  const folderBtn = document.querySelector("#homework-link-btn, #section-folder-btn");

  // 🔹 زر الطباعة
  const printBtn = document.createElement("button");
  printBtn.id = "print-btn";
  printBtn.className = "btn btn-print";
  printBtn.innerHTML = `<i class="fas fa-print"></i> طباعة`;
  Object.assign(printBtn.style, {
    backgroundColor: "#007bff",
    color: "#fff",
    marginRight: "10px",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer"
  });
  printBtn.onclick = printSection;

  // 🔹 زر PDF
  const pdfBtn = document.createElement("button");
  pdfBtn.id = "pdf-btn";
  pdfBtn.className = "btn btn-pdf";
  pdfBtn.innerHTML = `<i class="fas fa-file-pdf"></i> PDF`;
  Object.assign(pdfBtn.style, {
    backgroundColor: "#dc3545",
    color: "#fff",
    marginRight: "10px",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    cursor: "pointer"
  });
  pdfBtn.onclick = exportSectionToPDF;

  if (folderBtn) {
    folderBtn.insertAdjacentElement("afterend", printBtn);
    printBtn.insertAdjacentElement("afterend", pdfBtn);
  } else {
    container.appendChild(printBtn);
    container.appendChild(pdfBtn);
  }
}

// ✅ تصدير القسم إلى PDF (النص + الصور + روابط الملفات)
function exportSectionToPDF() {
  ensureJsPDFLoaded(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const title = `القسم ${currentSection}`;
    const data = sectionData[currentSection] || { text: "", files: [] };

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 105, 20, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    let y = 30;
    const pageHeight = doc.internal.pageSize.height;

    // نص القسم
    const splitText = doc.splitTextToSize(data.text || "لا توجد بيانات نصية.", 180);
    splitText.forEach(line => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 7;
    });

    // صور القسم
    data.files?.forEach(file => {
      if (file.type.startsWith("image")) {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 20;
        }
        doc.addImage(file.url, "JPEG", 15, y, 60, 60);
        y += 70;
      }
    });

    // 🔗 إضافة روابط الملفات الأخرى (PDF, Word, Excel, PowerPoint)
    const docFiles = data.files?.filter(
      f =>
        f.type.includes("pdf") ||
        f.type.includes("word") ||
        f.type.includes("presentation") ||
        f.type.includes("spreadsheet") ||
        f.type.includes("ms-powerpoint") ||
        f.type.includes("msword")
    );

    if (docFiles.length > 0) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      y += 10;
      doc.setFont("Helvetica", "bold");
      doc.text("🔗 روابط الملفات المرفقة:", 15, y);
      doc.setFont("Helvetica", "normal");
      y += 8;

      docFiles.forEach((file, i) => {
        const fileName = file.name || `ملف ${i + 1}`;
        const linkText = `${fileName}`;
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.textWithLink(linkText, 20, y, { url: file.url });
        y += 7;
      });
    }

    doc.save(`${title}.pdf`);
    showNotification("📄 تم تصدير القسم إلى PDF مع المرفقات بنجاح", "success");
  });
}

// ✅ طباعة القسم
function printSection() {
  const section = sectionData[currentSection];
  if (!section) return alert("لا توجد بيانات للطباعة.");

  const win = window.open("", "_blank");
  win.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <title>طباعة القسم ${currentSection}</title>
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 20px; }
          h2 { text-align: center; color: #007bff; }
          p { font-size: 15px; line-height: 1.8; }
          img { max-width: 200px; margin: 10px; border-radius: 8px; }
          a { display: block; color: #dc3545; margin-top: 10px; text-decoration: none; }
        </style>
      </head>
      <body>
        <h2>القسم ${currentSection}</h2>
        <p>${section.text || "لا توجد بيانات نصية."}</p>
        ${section.files?.map(f => f.type.startsWith("image") ? `<img src="${f.url}">` : "").join("")}
        <div style="margin-top:20px;">
          <h3>🔗 روابط الملفات:</h3>
          ${section.files?.map(f => !f.type.startsWith("image") ? `<a href="${f.url}" target="_blank">${f.name}</a>` : "").join("")}
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}

// 🔄 دمج الأزرار في عرض الصفحة
const originalRenderSectionWithButtons = window.renderSection;
window.renderSection = function () {
  originalRenderSectionWithButtons.apply(this, arguments);
  addTopButtons();
};
// ✅ عرض الأزرار المطلوبة فقط (التعديل ولوحة التحكم)
function customizeTopButtons() {
  const buttons = document.querySelectorAll(".dashboard-actions .btn");

  buttons.forEach(btn => {
    const text = btn.textContent.trim();

    // حذف الأزرار غير المطلوبة
    if (text.includes("حفظ البيانات") || text.includes("PDF")) {
      btn.remove();
    }
  });
}

// تشغيل بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", customizeTopButtons);
