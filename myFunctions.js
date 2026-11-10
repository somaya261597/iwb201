// دالة إظهار/إخفاء تفاصيل السيارة (تدعم إظهار تفاصيل عدة سيارات في آن واحد)
function toggleCarDetailsHandler() {
  $(".show-details").on("change", function () {
    let row = $(this).closest("tr");
    let detailsRow = row.next(".car-details");
    detailsRow.toggle();
  });
}

// دالة زر متابعة: يظهر النموذج فقط بعد اختيار سيارة واحدة على الأقل
function continueButtonHandler() {
  $("#continueBtn").on("click", function () {
    if ($(".choose-car:checked").length === 0) {
      alert("يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.");
      return;
    }
    $("#orderSection").slideDown();
  });
}

// دالة التحقق من حقول نموذج الطلب
function validateFields(fullName, nationalId, startDate, endDate, mobileNumber, email) {
  let nameRegex = /^[\u0600-\u06FF\s]+$/;                                   // أحرف هجائية عربية فقط
  let nationalIdRegex = /^(0[1-9]|1[0-4])[0-9]{9}$/;                        // 11 خانة وتبدأ بـ 01 إلى 14
  let dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}$/;  // صيغة dd-mm-yyyy
  let mobileRegex = /^09[345689][0-9]{7}$/;                                 // أرقام شبكتي Syriatel و MTN (طول 10 خانات ويبدأ بـ 09)
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;                            // صيغة بريد إلكتروني صحيحة

  // التحقق من الاسم الكامل (أحرف عربية فقط)
  if (fullName !== "" && !nameRegex.test(fullName)) {
    alert("خطأ في الاسم الكامل: إذا تم إدخاله، يجب أن يتكون من أحرف هجائية عربية فقط.");
    return false;
  }

  // التحقق من الرقم الوطني (11 خانة، أول خانتين من 01 إلى 14)
  if (nationalId === "" || !nationalIdRegex.test(nationalId)) {
    alert("خطأ في الرقم الوطني: يجب أن يكون إجبارياً ومكوناً من 11 خانة وتبدأ أول خانتين برمز محافظة صالح (01 إلى 14).");
    return false;
  }

  // التحقق من تاريخ بداية التأجير
  if (startDate === "" || !dateRegex.test(startDate)) {
    alert("خطأ في تاريخ بداية التأجير: يجب أن يكون بالصيغة الصحيحة dd-mm-yyyy.");
    return false;
  }

  // التحقق من تاريخ نهاية التأجير
  if (endDate === "" || !dateRegex.test(endDate)) {
    alert("خطأ في تاريخ نهاية التأجير: يجب أن يكون بالصيغة الصحيحة dd-mm-yyyy.");
    return false;
  }

  // التحقق من أن تاريخ النهاية لاحق لتاريخ البداية
  let [startDay, startMonth, startYear] = startDate.split("-").map(Number);
  let [endDay, endMonth, endYear] = endDate.split("-").map(Number);
  let startObj = new Date(startYear, startMonth - 1, startDay);
  let endObj = new Date(endYear, endMonth - 1, endDay);
  if (endObj <= startObj) {
    alert("خطأ في التواريخ: يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ بداية التأجير.");
    return false;
  }

  // التحقق من رقم الموبايل (Syriatel & MTN)
  if (mobileNumber !== "" && !mobileRegex.test(mobileNumber)) {
    alert("خطأ في رقم الموبايل: إذا تم إدخاله، يجب أن يطابق أرقام شبكتي Syriatel أو MTN (يبدأ بـ 09 ويتبعه 8 أرقام صحيحة).");
    return false;
  }

  // التحقق من البريد الإلكتروني
  if (email !== "" && !emailRegex.test(email)) {
    alert("خطأ في البريد الإلكتروني: إذا تم إدخاله، يرجى إدخال بريد إلكتروني صالح.");
    return false;
  }

  return true;
}

// دالة حساب الفاتورة للسيارات المختارة
function calculateOrderSummary() {
  let carNames = [];
  let totalDay = 0;

  $(".choose-car:checked").each(function () {
    let carRow = $(this).closest("tr");
    let name = carRow.attr("data-name");
    let price = parseFloat(carRow.attr("data-price"));
    carNames.push(name);
    totalDay += price;
  });

  return {
    carNames: carNames,
    totalDay: totalDay
  };
}

// دالة معالجة إرسال الطلب
function orderFormSubmitHandler() {
  $("#orderForm").on("submit", function (e) {
    e.preventDefault();

    let fullName = $.trim($("#fullName").val());
    let nationalId = $.trim($("#nationalId").val());
    let startDate = $.trim($("#orderDate").val()); // تاريخ بداية التأجير
    let endDate = $.trim($("#returnDate").val());   // تاريخ نهاية التأجير
    let mobileNumber = $.trim($("#mobileNumber").val());
    let email = $.trim($("#email").val());

    if (!validateFields(fullName, nationalId, startDate, endDate, mobileNumber, email)) {
      return;
    }
    let summary = calculateOrderSummary();
    let carNames = summary.carNames;
    let totalDay = summary.totalDay;

    if (carNames.length === 0) {
      alert("لم يتم اختيار أي سيارة.");
      return;
    }

    let [startDay, startMonth, startYear] = startDate.split("-").map(Number);
    let [endDay, endMonth, endYear] = endDate.split("-").map(Number);
    let startTime = Date.UTC(startYear, startMonth - 1, startDay);
    let endTime = Date.UTC(endYear, endMonth - 1, endDay);
    let rentalDays = (endTime - startTime) / (24 * 60 * 60 * 1000);
    let totalAmount = totalDay * rentalDays;
    let discount = rentalDays > 10 ? totalAmount * 0.05 : 0;
    let netAfterDiscount = totalAmount - discount;

    let result = "تم إرسال الطلب بنجاح.\n\n";
    result += "السيارات المختارة: " + carNames.join("، ") + "\n";
    result += "مدة التأجير: " + rentalDays + " يوم\n";
    result += "المبلغ اليومي: " + totalDay.toFixed(2) + " ل.س\n";
    result += "المبلغ الإجمالي: " + totalAmount.toFixed(2) + " ل.س\n";
    result += "الخصم (5% عند تجاوز 10 أيام): " + discount.toFixed(2) + " ل.س\n";
    result += "المبلغ الصافي بعد الخصم: " + netAfterDiscount.toFixed(2) + " ل.س";

    // فتح نافذة جديدة لعرض ملخص الفاتورة
    let newWindow = window.open("", "_blank", "width=600,height=400");
    newWindow.document.write(`
      <html>
        <head>
          <title>تفاصيل الفاتورة</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; line-height: 1.6; }
            h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 1.1em; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h2>ملخص الطلب</h2>
          <pre>${result}</pre>
        </body>
      </html>
    `);
    newWindow.document.close();
  });
}

// تفعيل الرابط الحالي في القائمة
function onActive() {
  let currentPath = window.location.pathname.split("/").pop();
  $(".nav-links a").each(function() {
    let linkPath = $(this).attr("href");

    if (linkPath === currentPath) {
      $(this).addClass("active");
    }
  });
}

// دالة تهيئة جميع المعالجات عند تحميل الصفحة
function initializeAppHandlers() {
  toggleCarDetailsHandler();
  continueButtonHandler();
  orderFormSubmitHandler();
  onActive();
}

// تهيئة الأحداث بعد تحميل الصفحة كاملة
$(document).ready(function () {
  initializeAppHandlers();
});