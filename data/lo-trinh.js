/* Lino: the road from a first lesson to an international certificate.
   Figures checked on 18/11/2026 against the publishers' own pages:
   - Cambridge: guided learning hours (cumulative from beginner): A2 180–200,
     B1 350–400, B2 500–600, C1 700–800, C2 1,000–1,200. Young Learners word
     lists (2018): Starters 497, Movers 898, Flyers 1,411 words (cumulative).
   - ETS: TOEIC minimum scores per CEFR level (Listening / Reading):
     A1 60/60, A2 110/115, B1 275/275, B2 400/385, C1 490/455.
   - IELTS: CEFR B1 4.0–5.0, B2 5.5–6.5, C1 7.0–8.0, C2 8.5–9.
   - JLPT (jlpt.jp): pass marks and sectional minimums; CEFR reference on
     score reports since December 2025.
   Vocabulary sizes for CEFR levels and all JLPT hours / word / kanji counts
   are widely used estimates, not official requirements (marked "ước tính"). */
window.LINO_LO_TRINH = {
  cap_nhat: '18/11/2026',

  cambridge: {
    ten: 'Cambridge (thiếu nhi, thiếu niên)',
    gioi: 'Hệ thống chứng chỉ của Đại học Cambridge, đi từ lớp mẫu giáo lớn đến trình độ gần như người bản xứ. Ba bài đầu (Starters, Movers, Flyers) không có đỗ hay trượt: con nhận khiên cho từng kỹ năng nên rất hợp để tạo động lực.',
    chang: [
      { ten: 'Pre A1 Starters', cefr: 'Pre A1', tuoi: '6 – 8 tuổi', tu: '≈ 500 từ', tuGhi: '497 từ trong danh sách Cambridge', gio: '≈ 100 giờ', thi: 'Nghe · Đọc và Viết · Nói, khoảng 45 phút', diem: 'Không đỗ/trượt. Tối đa 15 khiên (5 khiên mỗi kỹ năng).', con: 'Nghe câu ngắn, nhận ra từ quen thuộc, nói tên, tuổi, màu sắc, đồ vật quanh mình.' },
      { ten: 'A1 Movers', cefr: 'A1', tuoi: '8 – 11 tuổi', tu: '≈ 900 từ', tuGhi: '898 từ, cộng dồn từ Starters', gio: '≈ 200 giờ', thi: 'Nghe · Đọc và Viết · Nói, khoảng 62 phút', diem: 'Không đỗ/trượt. Tối đa 15 khiên.', con: 'Kể việc hằng ngày, hỏi đường đơn giản, đọc truyện ngắn có tranh.' },
      { ten: 'A2 Flyers', cefr: 'A2', tuoi: '9 – 12 tuổi', tu: '≈ 1.400 từ', tuGhi: '1.411 từ, cộng dồn từ Starters và Movers', gio: '≈ 300 giờ', thi: 'Nghe · Đọc và Viết · Nói, khoảng 75 phút', diem: 'Không đỗ/trượt. Tối đa 15 khiên. Đủ khiên là sẵn sàng lên KET.', con: 'Viết đoạn văn ngắn, kể lại câu chuyện, trò chuyện về sở thích.' },
      { ten: 'A2 Key for Schools (KET)', cefr: 'A2', tuoi: '11 – 14 tuổi', tu: '≈ 1.500 từ', tuGhi: 'ước tính', gio: '180 – 200 giờ', thi: 'Đọc và Viết 60 phút · Nghe 30 phút · Nói 8 – 10 phút', diem: 'Thang Cambridge 100 – 150. Đạt A2 từ 120 điểm; 140 – 150 được ghi trình độ B1.', con: 'Tự giới thiệu, viết email ngắn, hiểu thông báo đơn giản.' },
      { ten: 'B1 Preliminary for Schools (PET)', cefr: 'B1', tuoi: '12 – 15 tuổi', tu: '≈ 2.000 – 2.500 từ', tuGhi: 'ước tính', gio: '350 – 400 giờ', thi: 'Đọc 45 phút · Viết 45 phút · Nghe 30 phút · Nói 12 – 17 phút', diem: 'Thang 120 – 170. Đạt B1 từ 140 điểm; 160 – 170 được ghi trình độ B2.', con: 'Đọc hiểu bài báo ngắn, viết thư và câu chuyện, bày tỏ ý kiến.' },
      { ten: 'B2 First for Schools (FCE)', cefr: 'B2', tuoi: '14 – 17 tuổi', tu: '≈ 3.500 – 4.000 từ', tuGhi: 'ước tính', gio: '500 – 600 giờ', thi: 'Đọc và Dùng tiếng Anh 75 phút · Viết 80 phút · Nghe 40 phút · Nói 14 phút', diem: 'Thang 140 – 190. Đạt B2 từ 160 điểm; 180 – 190 được ghi trình độ C1.', con: 'Tranh luận, viết bài luận, theo kịp phim và bài giảng bằng tiếng Anh.' },
      { ten: 'C1 Advanced (CAE)', cefr: 'C1', tuoi: '16 tuổi trở lên', tu: '≈ 5.000 – 6.000 từ', tuGhi: 'ước tính', gio: '700 – 800 giờ', thi: 'Đọc và Dùng tiếng Anh 90 phút · Viết 90 phút · Nghe 40 phút · Nói 15 phút', diem: 'Thang 160 – 210. Đạt C1 từ 180 điểm; 200 – 210 được ghi trình độ C2.', con: 'Học đại học, làm việc hoàn toàn bằng tiếng Anh.' },
      { ten: 'C2 Proficiency (CPE)', cefr: 'C2', tuoi: '18 tuổi trở lên', tu: '8.000 từ trở lên', tuGhi: 'ước tính', gio: '1.000 – 1.200 giờ', thi: 'Đọc và Dùng tiếng Anh · Viết · Nghe · Nói', diem: 'Thang 180 – 230. Đạt C2 từ 200 điểm.', con: 'Dùng tiếng Anh tự nhiên như người bản xứ có học thức.' }
    ],
    moi: [
      'Bài thi trên máy tính cho thiếu nhi: Starters và Movers đã có bản thi trên máy tính, A2 Flyers trên máy tính dự kiến ra mắt năm 2027. Ở Việt Nam, tuỳ điểm thi vẫn có bài thi trên giấy.',
      'Danh sách từ vựng Starters, Movers, Flyers áp dụng từ bản sửa đổi 2018 vẫn đang dùng.',
      'Số giờ trên là tổng giờ học có giáo viên hướng dẫn, tính từ lúc mới bắt đầu (theo Cambridge). Trẻ nhỏ thường cần nhiều hơn 20 – 50% vì học qua trò chơi và tập trung ngắn hơn.'
    ],
    nguon: [
      ['Cambridge: các chứng chỉ cho thiếu nhi', 'https://www.cambridgeenglish.org/exams-and-tests/qualifications-young-learners/'],
      ['Cambridge: số giờ học có hướng dẫn', 'https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours'],
      ['Cambridge: thay đổi danh sách từ vựng 2018', 'https://assets.cambridgeenglish.org/webinars/yle-revisions-slides.pdf'],
      ['Cambridge: bài thi trên máy tính cho thiếu nhi', 'https://www.cambridgeenglish.org/news/view/cambridge-english-qualifications-digital-for-young-learners-were-highly-commended-at-the-2026-international-e-assessment-awards/']
    ]
  },

  ielts: {
    ten: 'IELTS',
    gioi: 'Chứng chỉ dùng để du học, xét tuyển đại học, xin học bổng và định cư. Chấm theo band 0 – 9 cho cả 4 kỹ năng. Bài thi thiết kế cho người từ 16 tuổi; con nhỏ hơn vẫn thi được nếu đủ trình độ.',
    chang: [
      { ten: 'IELTS 4.0 – 5.0', cefr: 'B1', tuoi: 'từ 14 – 15 tuổi', tu: '≈ 2.000 – 2.500 từ', tuGhi: 'ước tính', gio: '350 – 400 giờ', thi: 'Nghe · Đọc · Viết · Nói', diem: 'Band tổng là trung bình 4 kỹ năng, làm tròn đến 0,5.', con: 'Giao tiếp các tình huống quen thuộc, viết đoạn văn có ý rõ ràng.' },
      { ten: 'IELTS 5.5 – 6.5', cefr: 'B2', tuoi: 'từ 15 – 16 tuổi', tu: '≈ 3.500 – 5.000 từ', tuGhi: 'ước tính', gio: '500 – 600 giờ (6.5 thường cần thêm)', thi: 'Nghe · Đọc · Viết · Nói', diem: 'Nhiều trường đại học ở Việt Nam dùng để xét tuyển hoặc quy đổi điểm; du học thường cần 6.0 – 6.5.', con: 'Viết bài luận, trình bày quan điểm, đọc bài học thuật.' },
      { ten: 'IELTS 7.0 – 8.0', cefr: 'C1', tuoi: 'từ 16 tuổi', tu: '≈ 6.000 – 8.000 từ', tuGhi: 'ước tính', gio: '700 – 800 giờ', thi: 'Nghe · Đọc · Viết · Nói', diem: 'Hay được yêu cầu cho học bổng, ngành cạnh tranh, trường top.', con: 'Học và làm việc bằng tiếng Anh gần như không gặp trở ngại.' },
      { ten: 'IELTS 8.5 – 9.0', cefr: 'C2', tuoi: 'người lớn', tu: '10.000 từ trở lên', tuGhi: 'ước tính', gio: '1.000 – 1.200 giờ trở lên', thi: 'Nghe · Đọc · Viết · Nói', diem: 'Trình độ thành thạo cao nhất.', con: 'Dùng tiếng Anh chính xác, linh hoạt như người bản xứ.' }
    ],
    cau_truc: [
      ['Nghe', '30 phút', '4 phần, 40 câu'],
      ['Đọc', '60 phút', '3 bài đọc, 40 câu (Academic hoặc General Training)'],
      ['Viết', '60 phút', '2 bài viết'],
      ['Nói', '11 – 14 phút', 'Phỏng vấn trực tiếp với giám khảo, 3 phần']
    ],
    moi: [
      'Tại Việt Nam, IELTS đã chuyển hoàn toàn sang thi trên máy tính từ 29/3/2025. Từ giữa năm 2026, IELTS bỏ thi trên giấy trên toàn thế giới.',
      'Một số nơi cho chọn viết tay phần Viết trên giấy trong khi Nghe, Đọc làm trên máy tính (không áp dụng cho IELTS for UKVI).',
      'Từ 17/7/2026, phiếu điểm có thêm logo Ofqual và tên chứng chỉ; phiếu điểm cấp trước đó vẫn hợp lệ.',
      'Nội dung bài thi, kỹ năng kiểm tra và cách chấm điểm không thay đổi. Các tin về "dạng đề mới", "phạt bài viết theo mẫu" trên mạng chưa có nguồn chính thức.'
    ],
    nguon: [
      ['IELTS: thay đổi cách tổ chức thi', 'https://ielts.org/news-and-insights/updates-to-ielts-test-delivery'],
      ['IELTS: thay đổi phiếu điểm', 'https://ielts.org/news-and-insights/changes-to-test-report-forms'],
      ['IDP Việt Nam: thi IELTS trên giấy', 'https://ielts.idp.com/vietnam/about/news-and-articles/article-is-ielts-on-paper-still-available']
    ]
  },

  toeic: {
    ten: 'TOEIC',
    gioi: 'Chứng chỉ tiếng Anh trong môi trường công việc, hay dùng làm chuẩn đầu ra đại học và khi xin việc. Phổ biến nhất là bài Nghe – Đọc (10 – 990 điểm). Với các con dưới 15 tuổi, ETS khuyên thi TOEIC Bridge (trình độ A1 – B1).',
    chang: [
      { ten: 'TOEIC 225 trở lên', cefr: 'A2', tuoi: 'từ 15 tuổi', tu: '≈ 1.000 – 1.500 từ', tuGhi: 'ước tính', gio: '180 – 200 giờ', thi: 'Nghe 45 phút + Đọc 75 phút, 200 câu', diem: 'Tối thiểu theo ETS: Nghe 110, Đọc 115.', con: 'Hiểu thông báo, email ngắn và hội thoại đơn giản nơi làm việc.' },
      { ten: 'TOEIC 550 trở lên', cefr: 'B1', tuoi: 'sinh viên', tu: '≈ 2.000 – 2.500 từ', tuGhi: 'ước tính', gio: '350 – 400 giờ', thi: 'Nghe 45 phút + Đọc 75 phút, 200 câu', diem: 'Tối thiểu theo ETS: Nghe 275, Đọc 275. Nhiều trường đặt chuẩn đầu ra khoảng 450 – 600.', con: 'Trao đổi công việc quen thuộc, đọc tài liệu phổ thông.' },
      { ten: 'TOEIC 785 trở lên', cefr: 'B2', tuoi: 'sinh viên, người đi làm', tu: '≈ 3.500 – 4.000 từ', tuGhi: 'ước tính, nhiều từ kinh doanh', gio: '500 – 600 giờ', thi: 'Nghe 45 phút + Đọc 75 phút, 200 câu', diem: 'Tối thiểu theo ETS: Nghe 400, Đọc 385.', con: 'Họp, thuyết trình, viết báo cáo bằng tiếng Anh.' },
      { ten: 'TOEIC 945 trở lên', cefr: 'C1', tuoi: 'người đi làm', tu: '≈ 5.000 – 6.000 từ', tuGhi: 'ước tính', gio: '700 – 800 giờ', thi: 'Nghe 45 phút + Đọc 75 phút, 200 câu', diem: 'Tối thiểu theo ETS: Nghe 490, Đọc 455.', con: 'Làm việc trôi chảy trong môi trường quốc tế.' }
    ],
    cau_truc: [
      ['Nghe (Listening)', '45 phút', '100 câu, 5 – 495 điểm'],
      ['Đọc (Reading)', '75 phút', '100 câu, 5 – 495 điểm'],
      ['Nói (Speaking)', '≈ 20 phút', '0 – 200 điểm. Mốc ETS: B1 120, B2 160, C1 180'],
      ['Viết (Writing)', '≈ 60 phút', '0 – 200 điểm. Mốc ETS: B1 120, B2 150, C1 180']
    ],
    moi: [
      'Bài TOEIC Nghe – Đọc giữ nguyên dạng đề từ năm 2018.',
      'Tại Việt Nam, TOEIC do IIG Việt Nam (đại diện của ETS) tổ chức. Có thể dời lịch thi tối đa một lần, chậm nhất 5 ngày làm việc trước ngày thi, phí dời lịch bằng 50% lệ phí (theo quy định IIG công bố năm 2025).',
      'ETS lưu ý: mốc điểm CEFR là gợi ý, không nên dùng cứng nhắc.'
    ],
    nguon: [
      ['ETS: quy đổi điểm TOEIC sang CEFR', 'https://www.ets.org/pdfs/toeic/toeic-mapping-cefr-reference.pdf'],
      ['IIG Việt Nam: quy định tổ chức thi', 'https://iigvietnam.com/test-administration-regulations-for-english-tests-at-iig-vietnam/']
    ]
  },

  jlpt: {
    ten: 'Tiếng Nhật JLPT',
    gioi: 'Kỳ thi năng lực tiếng Nhật do Quỹ Giao lưu Quốc tế Nhật Bản tổ chức, từ N5 (dễ nhất) đến N1. Thi ở Việt Nam 2 lần mỗi năm, vào tháng 7 và tháng 12. JLPT chỉ thi đọc hiểu, nghe hiểu và kiến thức ngôn ngữ, không thi nói và viết.',
    chang: [
      { ten: 'N5', cefr: 'A1', tuoi: 'từ 10 tuổi', tu: '≈ 800 từ', tuGhi: 'ước tính · ≈ 100 Hán tự', gio: '300 – 450 giờ', thi: 'Từ vựng 20 phút · Ngữ pháp – Đọc 40 phút · Nghe 30 phút', diem: 'Đỗ khi tổng ≥ 80/180, phần Kiến thức ngôn ngữ – Đọc ≥ 38/120 và Nghe ≥ 19/60.', con: 'Đọc câu đơn giản bằng hiragana, katakana và Hán tự cơ bản; nghe hội thoại chậm.' },
      { ten: 'N4', cefr: 'A2', tuoi: 'từ 12 tuổi', tu: '≈ 1.500 từ', tuGhi: 'ước tính · ≈ 300 Hán tự', gio: '550 – 900 giờ', thi: 'Từ vựng 25 phút · Ngữ pháp – Đọc 55 phút · Nghe 35 phút', diem: 'Đỗ khi tổng ≥ 90/180, Kiến thức ngôn ngữ – Đọc ≥ 38/120, Nghe ≥ 19/60.', con: 'Hiểu hội thoại hằng ngày ở tốc độ chậm, đọc đoạn văn ngắn quen thuộc.' },
      { ten: 'N3', cefr: 'A2 – B1', tuoi: 'từ 14 tuổi', tu: '≈ 3.700 từ', tuGhi: 'ước tính · ≈ 650 Hán tự', gio: '900 – 1.500 giờ', thi: 'Từ vựng 30 phút · Ngữ pháp – Đọc 70 phút · Nghe 40 phút', diem: 'Đỗ khi tổng ≥ 95/180 và mỗi phần (Từ vựng – Ngữ pháp, Đọc, Nghe) ≥ 19/60. Bảng điểm ghi A2 nếu 95 – 103 điểm, B1 nếu từ 104 điểm.', con: 'Đọc tiêu đề báo, hiểu hội thoại gần tốc độ thật. Hay được yêu cầu khi đi làm việc tại Nhật.' },
      { ten: 'N2', cefr: 'B1 – B2', tuoi: 'từ 16 tuổi', tu: '≈ 6.000 từ', tuGhi: 'ước tính · ≈ 1.000 Hán tự', gio: '1.500 – 2.400 giờ', thi: 'Kiến thức ngôn ngữ – Đọc 105 phút · Nghe 50 phút', diem: 'Đỗ khi tổng ≥ 90/180 và mỗi phần ≥ 19/60. Bảng điểm ghi B1 nếu 90 – 111 điểm, B2 nếu từ 112 điểm.', con: 'Đọc báo, tài liệu công việc; mốc phổ biến để làm việc văn phòng, học đại học Nhật.' },
      { ten: 'N1', cefr: 'B2 – C1', tuoi: 'người lớn', tu: '≈ 10.000 từ', tuGhi: 'ước tính · ≈ 2.000 Hán tự', gio: '2.800 – 4.500 giờ', thi: 'Kiến thức ngôn ngữ – Đọc 110 phút · Nghe 55 phút', diem: 'Đỗ khi tổng ≥ 100/180 và mỗi phần ≥ 19/60. Bảng điểm ghi B2 nếu 100 – 141 điểm, C1 nếu từ 142 điểm.', con: 'Hiểu tiếng Nhật trong hầu hết tình huống, kể cả bài viết chuyên sâu.' }
    ],
    moi: [
      'Từ kỳ thi tháng 12/2025, bảng điểm của thí sinh đỗ có thêm trình độ CEFR để tham khảo (từ A1 đến C1, tính theo tổng điểm). CEFR này không đánh giá kỹ năng nói.',
      'Từ kỳ thi tháng 7/2026, người nhập cảnh Nhật Bản ngắn hạn (du lịch) không được đăng ký thi JLPT tại Nhật. Thi tại Việt Nam không bị ảnh hưởng.',
      'Kỳ thi tiếp theo: Chủ nhật 6/12/2026. Chính phủ Nhật đang xem xét tăng số kỳ thi và thi trực tuyến từ năm 2027 nhưng chưa có thông báo chính thức.',
      'JLPT không công bố danh sách từ vựng, Hán tự hay số giờ học. Các con số trên là ước tính phổ biến cho người học không dùng chữ Hán (đã tính cả giờ tự học). Người Việt có lợi thế nhờ từ Hán Việt.'
    ],
    nguon: [
      ['JLPT: cách tính điểm và điểm đỗ', 'https://www.jlpt.jp/e/guideline/results.html'],
      ['JLPT: trình độ CEFR tham khảo', 'https://www.jlpt.jp/e/about/cefr_reference.html'],
      ['Quỹ Giao lưu Quốc tế Nhật Bản: thêm CEFR vào bảng điểm', 'https://www.jpf.go.jp/e/project/japanese/teach/tsushin/news/202601.html'],
      ['Sydney JF: thông báo JLPT', 'https://sydney.jpf.go.jp/past-jlpt-news/']
    ]
  },

  /* the calculator: cumulative hours from beginner (middle of each range) */
  tinh: {
    anh: {
      hien: [['Mới bắt đầu', 0], ['Tương đương Starters (Pre A1)', 60], ['Tương đương Movers (A1)', 100], ['Tương đương Flyers / KET (A2)', 190],
             ['Tương đương PET / IELTS 4.0 – 5.0 (B1)', 375], ['Tương đương FCE / IELTS 5.5 – 6.5 (B2)', 550], ['Tương đương CAE / IELTS 7.0+ (C1)', 750]],
      dich: [['Pre A1 Starters', 60], ['A1 Movers', 100], ['A2 Flyers', 190], ['A2 Key (KET)', 190], ['B1 Preliminary (PET)', 375], ['B2 First (FCE)', 550], ['C1 Advanced (CAE)', 750],
             ['IELTS 5.0', 400], ['IELTS 6.0', 520], ['IELTS 6.5', 620], ['IELTS 7.0 trở lên', 750], ['TOEIC 550', 375], ['TOEIC 785', 550], ['TOEIC 945', 750]]
    },
    nhat: {
      hien: [['Chưa học', 0], ['Tương đương N5', 375], ['Tương đương N4', 725], ['Tương đương N3', 1200], ['Tương đương N2', 1950]],
      dich: [['N5', 375], ['N4', 725], ['N3', 1200], ['N2', 1950], ['N1', 3650]]
    }
  }
};
