const caseData = {
  id: "CASE-001",
  title: "Kayıp Prototip",

  description:
    "Bir şirketin prototipi kaybolmuştur. Sanık, prototipe erişimi olan çalışanlardan biridir. Kaybolma saati kesin olarak bilinmemektedir.",

  evidence: [
    {
      id: "E1",
      title: "Kartlı Giriş Kaydı",
      content:
        "Sanığa atanmış kart saat 22.10'da binanın girişinde kullanılmış."
    },
    {
      id: "E2",
      title: "Kamera Kaydı",
      content:
        "Kamerada yüzü seçilemeyen bir kişi, ekrandaki saate göre 22.10'da binaya giriyor."
    },
    {
      id: "E3",
      title: "Kamera Bakım Notu",
      content:
        "Olay günü kamera saatinin yaklaşık sekiz dakika ileri olabileceği bildirilmiş."
    }
  ]
};


module.exports=caseData;
