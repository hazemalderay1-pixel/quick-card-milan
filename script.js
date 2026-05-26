document.addEventListener("DOMContentLoaded", () => {
    // --- عناصر التحكم بالواجهة ---
    const templateOptions = document.querySelectorAll(".template-option");
    
    // عناصر طبقة الاسم (إعدادات التنسيق الموحد)
    const nameFontSelect = document.getElementById("nameFont");
    const nameSizeSlider = document.getElementById("nameSize");
    const nPosXSlider = document.getElementById("nPosX");
    const nPosYSlider = document.getElementById("nPosY");
    const nPosXVal = document.getElementById("nPosXVal");
    const nPosYVal = document.getElementById("nPosYVal");
    const nameColorButtons = document.querySelectorAll("#nameColors .color-btn");
    const nCustomColorInput = document.getElementById("nCustomColor");

    // حاوية الأسماء الديناميكية
    const namesContainer = document.getElementById("namesContainer");

    // أزرار العمليات والكانفاس
    const btnPreview = document.getElementById("btnPreview");
    const btnDownload = document.getElementById("btnDownload");
    const cardCanvas = document.getElementById("cardCanvas");
    const ctx = cardCanvas.getContext("2d");
    const dragHint = document.querySelector(".drag-hint");

    // النافذة المنبثقة (Modal)
    const previewModal = document.getElementById("previewModal");
    const modalImage = document.getElementById("modalImage");
    const closeModal = document.querySelector(".close-modal");
    const modalBtnDownload = document.getElementById("modalBtnDownload");

    // تفاصيل الأكورديون
    const accordionTitle = document.querySelector(".accordion-title");
    const settingsAccordion = document.querySelector(".settings-accordion");

    // أزرار العمليات العائمة
    const btnShare = document.getElementById("btnShare");
    const themeToggleBtn = document.getElementById("themeToggleBtn");

    // --- حالة التطبيق ---
    let currentTemplate = "template1";
    let isDragging = false;
    
    // قائمة أسماء المعايدة (كل اسم في بطاقة منفصلة)
    let names = [""];
    let activeNameIndex = 0;

    // الإعدادات الافتراضية لكل نموذج
    const templateSettings = {
        template1: {
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: 80,
            xPercent: 90,
            yPercent: 40,
            color: "#FFFFFF",
            fontWeight: "bold",
            textAlign: "right"
        },
        template2: {
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: 30,
            xPercent: 50,
            yPercent: 50,
            color: "#451331",
            fontWeight: "bold",
            textAlign: "center"
        },
        template3: {
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: 30,
            xPercent: 50,
            yPercent: 50,
            color: "#451331",
            fontWeight: "bold",
            textAlign: "center"
        },
        template4: {
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: 30,
            xPercent: 50,
            yPercent: 50,
            color: "#451331",
            fontWeight: "bold",
            textAlign: "center"
        },
        template5: {
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: 30,
            xPercent: 50,
            yPercent: 50,
            color: "#451331",
            fontWeight: "bold",
            textAlign: "center"
        },
        template6: {
            fontFamily: "IBM Plex Sans Arabic",
            fontSize: 30,
            xPercent: 50,
            yPercent: 50,
            color: "#451331",
            fontWeight: "bold",
            textAlign: "center"
        }
    };

    // الإعدادات البصرية الموحدة لكل البطاقات
    const nameStyle = {
        fontFamily: templateSettings.template1.fontFamily,
        fontSize: templateSettings.template1.fontSize,
        xPercent: templateSettings.template1.xPercent,
        yPercent: templateSettings.template1.yPercent,
        color: templateSettings.template1.color,
        fontWeight: templateSettings.template1.fontWeight,
        textAlign: templateSettings.template1.textAlign || "center",
        width: 0,
        height: templateSettings.template1.fontSize
    };

    // --- تحميل قوالب البطاقات المربعة ---
    const images = {
        template1: new Image(),
        template2: new Image(),
        template3: new Image(),
        template4: new Image(),
        template5: new Image(),
        template6: new Image()
    };
    images.template1.src = "template1.png?v=1.0.33";
    images.template2.src = "template2.png?v=1.0.33";
    images.template3.src = "template3.png?v=1.0.33";
    images.template4.src = "template4.png?v=1.0.33";
    images.template5.src = "template5.png?v=1.0.33";
    images.template6.src = "template6.png?v=1.0.33";

    images.template1.onload = () => { if (currentTemplate === "template1") drawCard(); };
    images.template2.onload = () => { if (currentTemplate === "template2") drawCard(); };
    images.template3.onload = () => { if (currentTemplate === "template3") drawCard(); };
    images.template4.onload = () => { if (currentTemplate === "template4") drawCard(); };
    images.template5.onload = () => { if (currentTemplate === "template5") drawCard(); };
    images.template6.onload = () => { if (currentTemplate === "template6") drawCard(); };

    function applyTemplateSettings(templateId) {
        const settings = templateSettings[templateId];
        if (!settings) return;
        
        nameStyle.fontFamily = settings.fontFamily;
        nameStyle.fontSize = settings.fontSize;
        nameStyle.xPercent = settings.xPercent;
        nameStyle.yPercent = settings.yPercent;
        nameStyle.color = settings.color;
        nameStyle.fontWeight = settings.fontWeight;
        nameStyle.textAlign = settings.textAlign || "center";
        
        // مزامنة عناصر التحكم بالواجهة مع الإعدادات الجديدة
        syncControlsWithStyle();
    }

    // التأكد من تحميل الخطوط قبل عملية الرسم المبدئية
    document.fonts.ready.then(() => {
        initApp();
    });

    // --- تهيئة التطبيق ---
    function initApp() {
        initTheme();
        initShare();
        renderNameInputs();
        syncControlsWithStyle();
        drawCard();
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // --- إدارة حقول الأسماء الديناميكية ---
    
    function renderNameInputs() {
        namesContainer.innerHTML = "";
        
        names.forEach((name, index) => {
            const row = document.createElement("div");
            row.className = "name-input-row";
            if (index === activeNameIndex) {
                row.classList.add("active-row");
            }
            
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
            
            // مستمعو أحداث حقل الإدخال
            const inputField = row.querySelector(".name-input-field");
            inputField.addEventListener("input", (e) => {
                names[index] = e.target.value;
                drawCard();
            });
            
            inputField.addEventListener("focus", () => {
                setActiveName(index);
            });
            
            inputField.addEventListener("click", () => {
                setActiveName(index);
            });
            
            // مستمع زر الحذف
            const deleteBtn = row.querySelector(".btn-delete-name");
            deleteBtn.addEventListener("click", () => {
                deleteName(index);
            });
            
            // مستمع زر الإضافة
            const addBtn = row.querySelector(".btn-add-name");
            addBtn.addEventListener("click", () => {
                addNewName();
            });
            
            namesContainer.appendChild(row);
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function setActiveName(index) {
        activeNameIndex = index;
        
        // تحديث الكلاس النشط لحقول الإدخال
        const inputs = document.querySelectorAll(".name-input-field");
        inputs.forEach(input => {
            const inputIdx = parseInt(input.getAttribute("data-index"));
            if (inputIdx === index) {
                input.classList.add("active");
            } else {
                input.classList.remove("active");
            }
        });
        
        drawCard();
    }

    function addNewName() {
        names.push("");
        activeNameIndex = names.length - 1;
        
        renderNameInputs();
        setActiveName(activeNameIndex);
        
        // نقل التركيز للحقل الجديد تلقائياً
        setTimeout(() => {
            const inputs = document.querySelectorAll(".name-input-field");
            const lastInput = inputs[inputs.length - 1];
            if (lastInput) {
                lastInput.focus();
            }
        }, 50);
    }

    function deleteName(index) {
        if (names.length <= 1) return;
        
        names.splice(index, 1);
        
        if (activeNameIndex >= names.length) {
            activeNameIndex = names.length - 1;
        }
        
        renderNameInputs();
        setActiveName(activeNameIndex);
    }

    function syncControlsWithStyle() {
        nameFontSelect.value = nameStyle.fontFamily;
        nameSizeSlider.value = nameStyle.fontSize;
        
        nPosXSlider.value = nameStyle.xPercent;
        nPosXVal.textContent = nameStyle.xPercent + "%";
        
        nPosYSlider.value = nameStyle.yPercent;
        nPosYVal.textContent = nameStyle.yPercent + "%";
        
        nameColorButtons.forEach(btn => {
            if (btn.getAttribute("data-color").toUpperCase() === nameStyle.color.toUpperCase()) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
        nCustomColorInput.value = nameStyle.color;
    }

    function hasAnyText() {
        return names.some(n => n.trim() !== "");
    }


    // --- دالة الرسم الأساسية ---
    function drawCard() {
        const activeNameText = names[activeNameIndex] || "";
        drawCardWithName(activeNameText);
    }

    function drawCardWithName(nameText) {
        const activeImg = images[currentTemplate];
        
        if (activeImg.complete && activeImg.naturalWidth !== 0) {
            // تحديث أبعاد الكانفاس لتطابق أبعاد الصورة الحقيقية تلقائياً
            if (cardCanvas.width !== activeImg.naturalWidth || cardCanvas.height !== activeImg.naturalHeight) {
                cardCanvas.width = activeImg.naturalWidth;
                cardCanvas.height = activeImg.naturalHeight;
            }
            ctx.drawImage(activeImg, 0, 0, cardCanvas.width, cardCanvas.height);
        } else {
            ctx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);
            ctx.fillStyle = document.body.classList.contains("dark-mode") ? "#121212" : "#f3f4f6";
            ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
            ctx.fillStyle = document.body.classList.contains("dark-mode") ? "#ffffff" : "#000000";
            ctx.font = "bold 40px Cairo";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("جاري تحميل قالب البطاقة...", cardCanvas.width / 2, cardCanvas.height / 2);
        }

        // رسم الاسم النشط فقط على الكانفاس لتسهيل المعاينة والتصميم
        drawSingleName(nameText);
    }

    // دالة رسم اسم مفرد على الكارت
    function drawSingleName(nameText) {
        let displayText = nameText.trim();
        
        // إذا كان حقل الاسم فارغاً، نعرض نصاً توضيحياً لتسهيل السحب والضبط
        if (displayText === "") {
            displayText = activeNameIndex === 0 ? "أحمد" : `الاسم الإضافي ${activeNameIndex + 1}`;
        }
        ctx.fillStyle = nameStyle.color;

        // ضبط إعدادات الخط
        let activeFontSize = nameStyle.fontSize;
        const weight = nameStyle.fontWeight || "500";
        ctx.font = `${weight} ${activeFontSize}px "${nameStyle.fontFamily}", Cairo, sans-serif`;
        ctx.textAlign = nameStyle.textAlign || "center";
        ctx.textBaseline = "middle";

        // حساب الحجم التلقائي للخط لمنع التجاوز عن أبعاد الكارت (1080)
        let measuredWidth = ctx.measureText(displayText).width;
        const maxWidth = cardCanvas.width * 0.9; // حد أقصى 90% من عرض الكارد
        
        while (measuredWidth > maxWidth && activeFontSize > 10) {
            activeFontSize -= 2;
            ctx.font = `${weight} ${activeFontSize}px "${nameStyle.fontFamily}", Cairo, sans-serif`;
            measuredWidth = ctx.measureText(displayText).width;
        }

        // حساب الإحداثيات الفعلية
        const x = (nameStyle.xPercent / 100) * cardCanvas.width;
        const y = (nameStyle.yPercent / 100) * cardCanvas.height;

        // رسم الاسم على الكارت
        ctx.fillText(displayText, x, y);

        // إعادة تعيين الظل
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // حفظ الأبعاد الفعلية للاسم لمعاينة السحب واللمس
        nameStyle.width = measuredWidth;
        nameStyle.height = activeFontSize;
    }

    // تفعيل فتح وإغلاق الأكورديون للخيارات المتقدمة
    accordionTitle.addEventListener("click", () => {
        settingsAccordion.classList.toggle("open");
    });

    // تفاعل اختيار القوالب
    templateOptions.forEach(option => {
        option.addEventListener("click", () => {
            templateOptions.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");
            currentTemplate = option.getAttribute("data-template");
            
            // تطبيق إعدادات هذا القالب الافتراضية
            applyTemplateSettings(currentTemplate);
            
            drawCard();
        });
    });

    // مستمعي الأحداث لتحديث إعدادات التنسيق الموحد للخط
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


    // --- منطق السحب والإفلات التفاعلي على الكانفاس ---

    function getPointerPos(e) {
        const rect = cardCanvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = ((clientX - rect.left) / rect.width) * cardCanvas.width;
        const y = ((clientY - rect.top) / rect.height) * cardCanvas.height;
        return { x, y };
    }

    // التحقق هل المؤشر فوق نص الاسم النشط
    function isPointerOverText(clickX, clickY) {
        const x = (nameStyle.xPercent / 100) * cardCanvas.width;
        const y = (nameStyle.yPercent / 100) * cardCanvas.height;
        const padding = 40; 

        if (nameStyle.textAlign === "right") {
            return (
                clickX >= x - (nameStyle.width || 100) - padding &&
                clickX <= x + padding &&
                clickY >= y - (nameStyle.height || 40) / 2 - padding &&
                clickY <= y + (nameStyle.height || 40) / 2 + padding
            );
        } else {
            return (
                clickX >= x - (nameStyle.width || 100) / 2 - padding &&
                clickX <= x + (nameStyle.width || 100) / 2 + padding &&
                clickY >= y - (nameStyle.height || 40) / 2 - padding &&
                clickY <= y + (nameStyle.height || 40) / 2 + padding
            );
        }
    }

    // بدء السحب
    function startDrag(e) {
        const pos = getPointerPos(e);
        if (isPointerOverText(pos.x, pos.y)) {
            isDragging = true;
            if (e.cancelable) e.preventDefault();
        }
    }

    // حركة السحب
    function doDrag(e) {
        const pos = getPointerPos(e);

        if (!isDragging) {
            if (isPointerOverText(pos.x, pos.y)) {
                cardCanvas.style.cursor = "grab";
            } else {
                cardCanvas.style.cursor = "default";
            }
            return;
        }

        if (e.cancelable) e.preventDefault();
        cardCanvas.style.cursor = "grabbing";

        let newXPercent = Math.round((pos.x / cardCanvas.width) * 100);
        let newYPercent = Math.round((pos.y / cardCanvas.height) * 100);

        newXPercent = Math.max(5, Math.min(95, newXPercent));
        newYPercent = Math.max(5, Math.min(95, newYPercent));

        nameStyle.xPercent = newXPercent;
        nameStyle.yPercent = newYPercent;

        // تحديث قيم السلايدرات للواجهة
        nPosXSlider.value = newXPercent;
        nPosXVal.textContent = newXPercent + "%";
        nPosYSlider.value = newYPercent;
        nPosYVal.textContent = newYPercent + "%";

        dragHint.style.display = "none";
        drawCard();
    }

    // إنهاء السحب
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


    // --- مشاركة الموقع ---
    function initShare() {
        btnShare.addEventListener("click", async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'صانع بطاقات تهنئة عيد الأضحى',
                        text: 'قم بتصميم بطاقة تهنئة مميزة لعيد الأضحى المبارك باسمك واسم أحبابك وحملها مجاناً!',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log("Error sharing:", err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("تم نسخ رابط الموقع بنجاح! يمكنك الآن مشاركته مع أحبابك. ✨");
                } catch (err) {
                    alert("رابط الموقع هو: " + window.location.href);
                }
            }
        });
    }


    // --- إدارة الوضع الليلي (Dark Mode) ---

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
        if (isDark) {
            themeToggleBtn.innerHTML = `<i data-lucide="sun"></i>`;
            themeToggleBtn.setAttribute("title", "تبديل الوضع المضيء");
        } else {
            themeToggleBtn.innerHTML = `<i data-lucide="moon"></i>`;
            themeToggleBtn.setAttribute("title", "تبديل الوضع الليلي");
        }
        if (window.lucide) {
            lucide.createIcons();
        }
    }


    // --- تحميل الصور الفردية والمتعددة بشكل منفصل ---

    function downloadImage() {
        const validNames = names.map(n => n.trim()).filter(n => n !== "");
        if (validNames.length === 0) {
            alert("الرجاء كتابة الاسم أولاً قبل تحميل البطاقة.");
            const firstInput = document.querySelector(".name-input-field");
            if (firstInput) firstInput.focus();
            return;
        }

        // نقوم بالتحميل التلقائي المتتابع لكل بطاقة بشكل منفصل تماماً كما طلب المستخدم
        validNames.forEach((nameText, idx) => {
            // رسم الاسم المحدد مؤقتاً لتصدير الكارت الخاص به
            drawCardWithName(nameText);
            
            const dataUrl = cardCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `تهنئة_عيد_الأضحى_${nameText}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            
            // تأخير بسيط لمنع المتصفح من حجب التنزيلات المتعددة
            setTimeout(() => {
                link.click();
                document.body.removeChild(link);
            }, idx * 250);
        });

        // إعادة رسم الكانفاس بالاسم النشط الحالي بعد انتهاء التصدير
        setTimeout(() => {
            drawCard();
        }, validNames.length * 250 + 50);
    }

    // زر العرض والمعاينة للبطاقة النشطة حالياً
    btnPreview.addEventListener("click", () => {
        const activeNameText = names[activeNameIndex].trim();
        if (activeNameText === "") {
            alert("الرجاء إدخال الاسم أولاً لعرض البطاقة.");
            const currentInput = document.querySelector(`.name-input-field[data-index="${activeNameIndex}"]`);
            if (currentInput) currentInput.focus();
            return;
        }

        drawCard();
        modalImage.src = cardCanvas.toDataURL("image/png");
        previewModal.classList.add("show");
    });

    // زر التحميل
    btnDownload.addEventListener("click", downloadImage);

    // إغلاق المودال
    closeModal.addEventListener("click", () => {
        previewModal.classList.remove("show");
    });

    modalBtnDownload.addEventListener("click", () => {
        const activeNameText = names[activeNameIndex].trim();
        if (activeNameText !== "") {
            drawCardWithName(activeNameText);
            const dataUrl = cardCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `تهنئة_عيد_الأضحى_${activeNameText}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // إعادة رسم الاسم النشط
            drawCard();
        }
        previewModal.classList.remove("show");
    });

    window.addEventListener("click", (e) => {
        if (e.target === previewModal) {
            previewModal.classList.remove("show");
        }
    });
});
