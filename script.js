document.addEventListener("DOMContentLoaded", () => {
    // --- عناصر التحكم بالواجهة ---
    const nameFontSelect = document.getElementById("nameFont");
    const nameSizeSlider = document.getElementById("nameSize");
    const nPosXSlider = document.getElementById("nPosX");
    const nPosYSlider = document.getElementById("nPosY");
    const nPosXVal = document.getElementById("nPosXVal");
    const nPosYVal = document.getElementById("nPosYVal");
    const nameColorButtons = document.querySelectorAll("#nameColors .color-btn");
    const nCustomColorInput = document.getElementById("nCustomColor");

    const namesContainer = document.getElementById("namesContainer");
    const btnPreview = document.getElementById("btnPreview");
    const btnDownload = document.getElementById("btnDownload");
    const cardCanvas = document.getElementById("cardCanvas");
    const ctx = cardCanvas.getContext("2d");
    const dragHint = document.querySelector(".drag-hint");

    const previewModal = document.getElementById("previewModal");
    const modalImage = document.getElementById("modalImage");
    const closeModal = document.querySelector(".close-modal");
    const modalBtnDownload = document.getElementById("modalBtnDownload");

    const accordionTitle = document.querySelector(".accordion-title");
    const settingsAccordion = document.querySelector(".settings-accordion");

    const btnShare = document.getElementById("btnShare");
    const themeToggleBtn = document.getElementById("themeToggleBtn");

    const templatesGrid = document.getElementById("templatesGrid");
    const genderSection = document.getElementById("genderSection");
    const genderMaleBtn = document.getElementById("genderMale");
    const genderFemaleBtn = document.getElementById("genderFemale");

    // --- لون ميلان الغامق ---
    const MILAN_DARK = "#451331";
    // لون ميلان الأخضر (من صورة 5)
    const MILAN_GREEN = "#2E5B2A";

    // --- إعدادات كل نموذج ---
    const templateSettings = {
        template1: {
            fontFamily: "Almarai",
            fontSize: 90,
            xPercent: 87,
            yPercent: 40,
            color: "#FFFFFF",
            textAlign: "right",
            lineMode: "single"
        },
        template2: {
            fontFamily: "Almarai",
            fontSize: 90,
            xPercent: 50,
            yPercent: 74,
            color: MILAN_DARK,
            textAlign: "center",
            lineMode: "gender"   // اخوكم/اختكم + سطر فاضي + الاسم
        },
        template3: {
            fontFamily: "Almarai",
            fontSize: 95,
            xPercent: 50,
            yPercent: 85,
            color: "#FFFFFF",
            textAlign: "center",
            lineMode: "single"
        },
        template4: {
            fontFamily: "Cairo",
            fontSize: 66,
            xPercent: 50,
            yPercent: 93,
            color: MILAN_DARK,
            textAlign: "center",
            lineMode: "single"
        },
        template5: {
            fontFamily: "Cairo",
            fontSize: 66,
            xPercent: 50,
            yPercent: 87,
            color: MILAN_GREEN,
            textAlign: "center",
            lineMode: "single"
        },
        template6: {
            fontFamily: "Almarai",
            fontSize: 90,
            xPercent: 87,
            yPercent: 40,
            color: "#FFFFFF",
            textAlign: "right",
            lineMode: "single"
        }
    };

    // --- حالة التطبيق ---
    let currentTemplate = "template1";
    let isDragging = false;
    let names = [""];
    let activeNameIndex = 0;
    let currentGender = "male"; // "male" = اخوكم | "female" = اختكم

    // الإعدادات البصرية الحالية (تتغير مع كل نموذج)
    const nameStyle = {
        fontFamily: "Almarai",
        fontSize: 90,
        xPercent: 87,
        yPercent: 40,
        color: "#FFFFFF",
        textAlign: "right",
        lineMode: "single",
        width: 0,
        height: 90
    };

    // --- تحميل قوالب البطاقات الستة ---
    const images = {};
    for (let i = 1; i <= 6; i++) {
        images[`template${i}`] = new Image();
        images[`template${i}`].src = `template${i}.jpg?v=2.0.0`;
        images[`template${i}`].onload = () => {
            if (currentTemplate === `template${i}`) drawCard();
        };
    }

    // بناء شبكة النماذج ديناميكياً
    function buildTemplatesGrid() {
        templatesGrid.innerHTML = "";
        for (let i = 1; i <= 6; i++) {
            const div = document.createElement("div");
            div.className = `template-option${i === 1 ? " active" : ""}`;
            div.setAttribute("data-template", `template${i}`);
            div.innerHTML = `
                <div class="option-image-wrapper">
                    <img src="template${i}.jpg?v=2.0.0" alt="النموذج ${i}" onerror="this.src='https://placehold.co/300x300/451331/ffffff?text=Template+${i}'">
                    <div class="selected-badge"><i data-lucide="check"></i></div>
                </div>
                <span>النموذج ${i}</span>
            `;
            div.addEventListener("click", () => {
                document.querySelectorAll(".template-option").forEach(opt => opt.classList.remove("active"));
                div.classList.add("active");
                currentTemplate = `template${i}`;
                applyTemplateSettings(currentTemplate);
                drawCard();
            });
            templatesGrid.appendChild(div);
        }
        if (window.lucide) lucide.createIcons();
    }

    // تطبيق إعدادات النموذج المحدد
    function applyTemplateSettings(tpl) {
        const s = templateSettings[tpl];
        nameStyle.fontFamily = s.fontFamily;
        nameStyle.fontSize = s.fontSize;
        nameStyle.xPercent = s.xPercent;
        nameStyle.yPercent = s.yPercent;
        nameStyle.color = s.color;
        nameStyle.textAlign = s.textAlign;
        nameStyle.lineMode = s.lineMode;

        // تحديث عناصر التحكم
        nameFontSelect.value = s.fontFamily;
        nameSizeSlider.value = s.fontSize;
        nPosXSlider.value = s.xPercent;
        nPosXVal.textContent = s.xPercent + "%";
        nPosYSlider.value = s.yPercent;
        nPosYVal.textContent = s.yPercent + "%";

        // تحديث أزرار اللون
        nameColorButtons.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-color").toUpperCase() === s.color.toUpperCase());
        });
        nCustomColorInput.value = s.color;

        // إظهار/إخفاء قسم الجنس
        if (s.lineMode === "gender") {
            genderSection.classList.add("visible");
        } else {
            genderSection.classList.remove("visible");
        }
    }

    // تهيئة التطبيق
    document.fonts.ready.then(() => {
        buildTemplatesGrid();
        initTheme();
        initShare();
        renderNameInputs();
        applyTemplateSettings(currentTemplate);
        drawCard();
        if (window.lucide) lucide.createIcons();
    });

    // --- إدارة حقول الأسماء ---
    function renderNameInputs() {
        namesContainer.innerHTML = "";
        names.forEach((name, index) => {
            const row = document.createElement("div");
            row.className = `name-input-row${index === activeNameIndex ? " active-row" : ""}`;
            const isLast = index === names.length - 1;
            row.innerHTML = `
                <div class="input-with-actions">
                    <input type="text" class="name-input-field ${index === activeNameIndex ? 'active' : ''}"
                           data-index="${index}"
                           placeholder="${index === 0 ? 'اكتب الاسم هنا (أحمد)' : `الاسم الإضافي ${index + 1}`}"
                           value="${name}"
                           maxlength="40"
                           autocomplete="off">
                    <button class="btn-delete-name" data-index="${index}" title="حذف الاسم" style="${names.length > 1 ? 'display: flex;' : 'display: none;'}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <button class="btn-add-name" title="إضافة اسم آخر" style="${isLast ? 'display: flex;' : 'visibility: hidden;'}">
                    <i data-lucide="plus"></i>
                </button>
            `;

            const inputField = row.querySelector(".name-input-field");
            inputField.addEventListener("input", (e) => {
                names[index] = e.target.value;
                drawCard();
            });
            inputField.addEventListener("focus", () => setActiveName(index));
            inputField.addEventListener("click", () => setActiveName(index));

            row.querySelector(".btn-delete-name").addEventListener("click", () => deleteName(index));
            row.querySelector(".btn-add-name").addEventListener("click", () => addNewName());

            namesContainer.appendChild(row);
        });
        if (window.lucide) lucide.createIcons();
    }

    function setActiveName(index) {
        activeNameIndex = index;
        document.querySelectorAll(".name-input-field").forEach(input => {
            input.classList.toggle("active", parseInt(input.getAttribute("data-index")) === index);
        });
        drawCard();
    }

    function addNewName() {
        names.push("");
        activeNameIndex = names.length - 1;
        renderNameInputs();
        setActiveName(activeNameIndex);
        setTimeout(() => {
            const inputs = document.querySelectorAll(".name-input-field");
            if (inputs[inputs.length - 1]) inputs[inputs.length - 1].focus();
        }, 50);
    }

    function deleteName(index) {
        if (names.length <= 1) return;
        names.splice(index, 1);
        if (activeNameIndex >= names.length) activeNameIndex = names.length - 1;
        renderNameInputs();
        setActiveName(activeNameIndex);
    }

    // --- دالة الرسم الأساسية ---
    function drawCard() {
        drawCardWithName(names[activeNameIndex] || "");
    }

    function drawCardWithName(nameText) {
        const activeImg = images[currentTemplate];
        ctx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);

        if (activeImg && activeImg.complete && activeImg.naturalWidth !== 0) {
            ctx.drawImage(activeImg, 0, 0, cardCanvas.width, cardCanvas.height);
        } else {
            ctx.fillStyle = "#451331";
            ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 40px Cairo";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("جاري تحميل قالب البطاقة...", cardCanvas.width / 2, cardCanvas.height / 2);
        }

        drawSingleName(nameText);
    }

    function drawSingleName(nameText) {
        let displayName = nameText.trim();
        if (displayName === "") {
            displayName = activeNameIndex === 0 ? "أحمد" : `الاسم الإضافي ${activeNameIndex + 1}`;
        }

        ctx.fillStyle = nameStyle.color;

        let activeFontSize = nameStyle.fontSize;
        const fontStr = `bold ${activeFontSize}px "${nameStyle.fontFamily}", Cairo, sans-serif`;
        ctx.font = fontStr;

        // اتجاه النص
        if (nameStyle.textAlign === "right") {
            ctx.textAlign = "right";
            ctx.direction = "rtl";
        } else {
            ctx.textAlign = "center";
            ctx.direction = "rtl";
        }
        ctx.textBaseline = "middle";

        const maxWidth = cardCanvas.width * 0.88;

        // تقليص الخط إذا تجاوز العرض
        let measuredWidth = ctx.measureText(displayName).width;
        while (measuredWidth > maxWidth && activeFontSize > 18) {
            activeFontSize -= 2;
            ctx.font = `bold ${activeFontSize}px "${nameStyle.fontFamily}", Cairo, sans-serif`;
            measuredWidth = ctx.measureText(displayName).width;
        }

        // تأثير الظل
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const x = (nameStyle.xPercent / 100) * cardCanvas.width;
        const y = (nameStyle.yPercent / 100) * cardCanvas.height;

        if (nameStyle.lineMode === "gender") {
            // نموذج 2: سطر اخوكم/اختكم + سطر فاضي (مسافة) + الاسم
            const prefix = currentGender === "male" ? "اخوكم" : "اختكم";
            const lineSpacing = activeFontSize * 1.6; // مسافة بين الأسطر مع سطر فاضي

            // رسم السطر الأول (اخوكم/اختكم)
            ctx.fillText(prefix, x, y - lineSpacing / 2);

            // رسم الاسم في السطر الثاني (بعد مسافة)
            ctx.fillText(displayName, x, y + lineSpacing / 2);

            // حفظ الأبعاد
            nameStyle.width = Math.max(ctx.measureText(prefix).width, measuredWidth);
            nameStyle.height = lineSpacing + activeFontSize;
        } else {
            // رسم عادي
            ctx.fillText(displayName, x, y);
            nameStyle.width = measuredWidth;
            nameStyle.height = activeFontSize;
        }

        // إعادة تعيين الظل
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // --- مستمعو الأحداث للإعدادات ---
    accordionTitle.addEventListener("click", () => {
        settingsAccordion.classList.toggle("open");
    });

    nameFontSelect.addEventListener("change", (e) => {
        nameStyle.fontFamily = e.target.value;
        drawCard();
    });

    nameSizeSlider.addEventListener("input", (e) => {
        nameStyle.fontSize = parseInt(e.target.value);
        drawCard();
    });

    nPosXSlider.addEventListener("input", (e) => {
        nameStyle.xPercent = parseInt(e.target.value);
        nPosXVal.textContent = nameStyle.xPercent + "%";
        drawCard();
    });

    nPosYSlider.addEventListener("input", (e) => {
        nameStyle.yPercent = parseInt(e.target.value);
        nPosYVal.textContent = nameStyle.yPercent + "%";
        drawCard();
    });

    nameColorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            nameColorButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            nameStyle.color = btn.getAttribute("data-color");
            nCustomColorInput.value = nameStyle.color;
            drawCard();
        });
    });

    nCustomColorInput.addEventListener("input", (e) => {
        nameColorButtons.forEach(b => b.classList.remove("active"));
        nameStyle.color = e.target.value;
        drawCard();
    });

    // --- أزرار الجنس ---
    genderMaleBtn.addEventListener("click", () => {
        currentGender = "male";
        genderMaleBtn.classList.add("active");
        genderFemaleBtn.classList.remove("active");
        drawCard();
    });

    genderFemaleBtn.addEventListener("click", () => {
        currentGender = "female";
        genderFemaleBtn.classList.add("active");
        genderMaleBtn.classList.remove("active");
        drawCard();
    });

    // --- السحب والإفلات ---
    function getPointerPos(e) {
        const rect = cardCanvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: ((clientX - rect.left) / rect.width) * cardCanvas.width,
            y: ((clientY - rect.top) / rect.height) * cardCanvas.height
        };
    }

    function isPointerOverText(clickX, clickY) {
        const x = (nameStyle.xPercent / 100) * cardCanvas.width;
        const y = (nameStyle.yPercent / 100) * cardCanvas.height;
        const padding = 50;
        return (
            clickX >= x - (nameStyle.width || 100) / 2 - padding &&
            clickX <= x + (nameStyle.width || 100) / 2 + padding &&
            clickY >= y - (nameStyle.height || 90) / 2 - padding &&
            clickY <= y + (nameStyle.height || 90) / 2 + padding
        );
    }

    function startDrag(e) {
        const pos = getPointerPos(e);
        if (isPointerOverText(pos.x, pos.y)) {
            isDragging = true;
            if (e.cancelable) e.preventDefault();
        }
    }

    function doDrag(e) {
        const pos = getPointerPos(e);
        if (!isDragging) {
            cardCanvas.style.cursor = isPointerOverText(pos.x, pos.y) ? "grab" : "default";
            return;
        }
        if (e.cancelable) e.preventDefault();
        cardCanvas.style.cursor = "grabbing";

        nameStyle.xPercent = Math.max(5, Math.min(95, Math.round((pos.x / cardCanvas.width) * 100)));
        nameStyle.yPercent = Math.max(5, Math.min(95, Math.round((pos.y / cardCanvas.height) * 100)));

        nPosXSlider.value = nameStyle.xPercent;
        nPosXVal.textContent = nameStyle.xPercent + "%";
        nPosYSlider.value = nameStyle.yPercent;
        nPosYVal.textContent = nameStyle.yPercent + "%";

        dragHint.style.display = "none";
        drawCard();
    }

    function stopDrag() {
        isDragging = false;
        cardCanvas.style.cursor = "default";
    }

    cardCanvas.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
    cardCanvas.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", doDrag, { passive: false });
    window.addEventListener("touchend", stopDrag);

    // --- المشاركة ---
    function initShare() {
        btnShare.addEventListener("click", async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'صانع بطاقات تهنئة - ميلان',
                        text: 'قم بتصميم بطاقة تهنئة مميزة باسمك وحملها مجاناً!',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log("Error sharing:", err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("تم نسخ رابط الموقع بنجاح!");
                } catch (err) {
                    alert("رابط الموقع هو: " + window.location.href);
                }
            }
        });
    }

    // --- الوضع الليلي ---
    function initTheme() {
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
        document.body.classList.toggle("dark-mode", isDark);
        updateThemeIcon(isDark);
    }

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateThemeIcon(isDark);
        drawCard();
    });

    function updateThemeIcon(isDark) {
        themeToggleBtn.innerHTML = isDark ? `<i data-lucide="sun"></i>` : `<i data-lucide="moon"></i>`;
        themeToggleBtn.setAttribute("title", isDark ? "تبديل الوضع المضيء" : "تبديل الوضع الليلي");
        if (window.lucide) lucide.createIcons();
    }

    // --- التحميل ---
    function downloadImage() {
        const validNames = names.map(n => n.trim()).filter(n => n !== "");
        if (validNames.length === 0) {
            alert("الرجاء كتابة الاسم أولاً قبل تحميل البطاقة.");
            const firstInput = document.querySelector(".name-input-field");
            if (firstInput) firstInput.focus();
            return;
        }

        validNames.forEach((nameText, idx) => {
            drawCardWithName(nameText);
            const dataUrl = cardCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `تهنئة_ميلان_${nameText}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            setTimeout(() => {
                link.click();
                document.body.removeChild(link);
            }, idx * 250);
        });

        setTimeout(() => drawCard(), validNames.length * 250 + 50);
    }

    btnPreview.addEventListener("click", () => {
        const activeNameText = names[activeNameIndex].trim();
        if (activeNameText === "") {
            alert("الرجاء إدخال الاسم أولاً لعرض البطاقة.");
            return;
        }
        drawCard();
        modalImage.src = cardCanvas.toDataURL("image/png");
        previewModal.classList.add("show");
    });

    btnDownload.addEventListener("click", downloadImage);

    closeModal.addEventListener("click", () => previewModal.classList.remove("show"));

    modalBtnDownload.addEventListener("click", () => {
        const activeNameText = names[activeNameIndex].trim();
        if (activeNameText !== "") {
            drawCardWithName(activeNameText);
            const dataUrl = cardCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `تهنئة_ميلان_${activeNameText}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            drawCard();
        }
        previewModal.classList.remove("show");
    });

    window.addEventListener("click", (e) => {
        if (e.target === previewModal) previewModal.classList.remove("show");
    });
});
