// Facility Page Mapper - 시설 상세 페이지 동적 매핑
var FacilityMapper = {
  map: function(data) {
    if (!data) return;

    // MAPPER: facilities[current].images[isSelected] + name
    this.mapHeroSlides(data);

    // MAPPER: facilities[current] (name, usageGuide, images[0-2])
    this.mapFacilityDetail(data);

    // MAPPER: customFields.pages.facility[current].sections[0].about (title + images tags)
    this.mapFacilityAbout(data);

    // MAPPER: facilities[] (excluding current facility - name + images)
    this.mapFacilityPreview(data);

    // MAPPER: facilities[] (layout-map + active facilities)
    this.mapFacilityNavigation(data);
  },

  getCurrentFacility: function(data) {
    var facilities = (data && data.property && data.property.facilities) || [];
    var facilityId = new URLSearchParams(window.location.search).get('facility_id');
    if (facilityId) {
      return facilities.find(function(f) { return f.id === facilityId; }) || facilities[0];
    }
    return facilities[0];
  },

  // Con0: 히어로 슬라이드 (isSelected 이미지들)
  mapHeroSlides: function(data) {
    var facility = this.getCurrentFacility(data);
    if (!facility) return;

    var wrapper = document.querySelector('.con0 .swiper-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = '';

    // isSelected 이미지만 필터링
    var selectedImages = [];
    if (facility.images && facility.images.length > 0) {
      selectedImages = facility.images.filter(function(img) { return img.isSelected; });
    }

    // 선택된 이미지가 있으면 최대 3개 표시
    if (selectedImages.length > 0) {
      selectedImages.slice(0, 3).forEach(function(img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';

        var imgDiv = document.createElement('div');
        imgDiv.className = 'img';

        if (img && img.url) {
          imgDiv.style.backgroundImage = 'url(' + img.url + ')';
          imgDiv.style.backgroundRepeat = 'no-repeat';
          imgDiv.style.backgroundPosition = 'center';
          imgDiv.style.backgroundSize = 'cover';
        } else {
          ImageHelpers.applyBackgroundPlaceholder(imgDiv);
        }

        slide.appendChild(imgDiv);
        wrapper.appendChild(slide);
      });
    } else {
      // 이미지 없으면 placeholder
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      var imgDiv = document.createElement('div');
      imgDiv.className = 'img';
      ImageHelpers.applyBackgroundPlaceholder(imgDiv);
      slide.appendChild(imgDiv);
      wrapper.appendChild(slide);
    }

    // 시설명 매핑
    var tx1El = document.querySelector('.con0 .tx1');
    if (tx1El) {
      tx1El.textContent = facility.name || '';
    }

    // Swiper 초기화
    var con0Container = document.querySelector('.con0');
    if (con0Container) {
      var con0Swiper = con0Container.swiper;
      if (con0Swiper) {
        con0Swiper.destroy();
      }

      new Swiper(con0Container.querySelector('.swiper-container'), {
        slidesPerView: 1,
        loop: selectedImages.length > 1,
        effect: 'fade',
        autoplay: selectedImages.length > 1 ? {
          delay: 4000,
          disableOnInteraction: false,
        } : false,
        navigation: {
          nextEl: con0Container.querySelector('.swiper-button-next'),
          prevEl: con0Container.querySelector('.swiper-button-prev'),
        },
      });
    }
  },

  // Con9: 시설 상세정보 (이름, 설명, 이용안내, 3개 이미지)
  mapFacilityDetail: function(data) {
    var facility = this.getCurrentFacility(data);
    if (!facility) return;

    // Special 번호 매핑 (tx3) - displayOrder 기반
    var tx3El = document.querySelector('[data-facility-name-en]');
    if (tx3El) {
      var facilities = (data && data.property && data.property.facilities) || [];
      var facilityIndex = facilities.findIndex(function(f) { return f.id === facility.id; });
      var displayNumber = String(facilityIndex + 1).padStart(2, '0');
      tx3El.textContent = 'Special ' + displayNumber;
    }

    // 한글명 매핑 (tx0)
    var tx0El = document.querySelector('[data-facility-name]');
    if (tx0El) {
      tx0El.textContent = facility.name || '';
    }

    // 이용안내 매핑 (tx1) - customFields hero.title 우선, 없으면 usageGuide fallback
    var tx1El = document.querySelector('[data-facility-usage]');
    if (tx1El) {
      var heroTitle = null;
      if (data.homepage && data.homepage.customFields && data.homepage.customFields.pages && data.homepage.customFields.pages.facility) {
        var customFacility = data.homepage.customFields.pages.facility.find(function(f) { return f.id === facility.id; });
        if (customFacility && customFacility.sections && customFacility.sections[0] && customFacility.sections[0].hero && customFacility.sections[0].hero.title) {
          heroTitle = customFacility.sections[0].hero.title;
        }
      }

      var usageText = (heroTitle && heroTitle.trim()) ? heroTitle : (facility.usageGuide || '');
      tx1El.innerHTML = usageText.replace(/\n/g, '<br>');
    }

    // 3개 이미지 매핑
    var selectedImages = [];
    if (facility.images && facility.images.length > 0) {
      selectedImages = facility.images.filter(function(img) { return img.isSelected; });
    }

    // 이미지 없으면 첫 번째 이미지 사용
    if (selectedImages.length === 0 && facility.images && facility.images.length > 0) {
      selectedImages = facility.images;
    }

    var imageSelectors = [
      '[data-facility-image-0]',
      '[data-facility-image-1]',
      '[data-facility-image-2]',
    ];

    imageSelectors.forEach(function(selector, index) {
      var el = document.querySelector(selector);
      if (el) {
        if (selectedImages[index] && selectedImages[index].url) {
          if (el.tagName === 'IMG') {
            // img 태그
            el.src = selectedImages[index].url;
          } else {
            // div 배경이미지
            el.style.backgroundImage = 'url(' + selectedImages[index].url + ')';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';
            el.style.backgroundSize = 'cover';
          }
        } else {
          if (el.tagName === 'IMG') {
            ImageHelpers.applyPlaceholder(el);
          } else {
            ImageHelpers.applyBackgroundPlaceholder(el);
          }
        }
      }
    });
  },

  // CON4: 시설 슬라이드 매핑 (모든 시설 포함, 현재 시설 클릭 불가)
  // 슬라이드 텍스트: 좌측 SPECIAL #N(순서), 우측 부대시설명
  mapFacilityPreview: function(data) {
    var currentFacility = this.getCurrentFacility(data);
    var facilities = data.property.facilities || [];
    var wrapper = document.querySelector('.con4 .swiper-wrapper');
    if (!wrapper) return;

    // 기존 슬라이드 제거 (샘플 제거)
    wrapper.innerHTML = '';

    facilities.forEach(function(facility, index) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';

      var link = document.createElement('a');
      // 현재 시설이면 href 제거, 아니면 facility 페이지로
      if (currentFacility && facility.id === currentFacility.id) {
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.6';
      } else {
        link.href = 'facility.html?facility_id=' + facility.id;
      }

      var imgDiv = document.createElement('div');
      imgDiv.className = 'img';

      // facility.images[]에서 isSelected === true인 첫 이미지 찾기
      var imageUrl = null;
      if (facility.images && facility.images.length > 0) {
        var selectedImg = facility.images.find(function(img) { return img.isSelected; });
        if (selectedImg && selectedImg.url) {
          imageUrl = selectedImg.url;
        } else if (facility.images[0] && facility.images[0].url) {
          // 선택된 이미지가 없으면 첫 번째 이미지 사용
          imageUrl = facility.images[0].url;
        }
      }

      if (imageUrl) {
        imgDiv.style.backgroundImage = 'url(' + imageUrl + ')';
        imgDiv.style.backgroundRepeat = 'no-repeat';
        imgDiv.style.backgroundPosition = 'center';
      } else {
        ImageHelpers.applyBackgroundPlaceholder(imgDiv);
      }

      var textDiv = document.createElement('div');
      textDiv.className = 'tx';

      // 좌측: SPECIAL #N (순서)
      var tx1 = document.createElement('div');
      tx1.className = 'tx1';
      tx1.textContent = 'SPECIAL #' + (index + 1);

      // 우측: 부대시설명
      var tx2 = document.createElement('div');
      tx2.className = 'tx2';
      tx2.textContent = facility.name || '';

      textDiv.appendChild(tx1);
      textDiv.appendChild(tx2);
      link.appendChild(imgDiv);
      link.appendChild(textDiv);
      slide.appendChild(link);
      wrapper.appendChild(slide);
    });
  },

  // Con4: 시설 제목(about.title, 없으면 '준비된 특별함') + 부대시설명 태그 (최대 3개)
  mapFacilityAbout: function(data) {
    var facilities = (data && data.property && data.property.facilities) || [];
    var currentFacility = this.getCurrentFacility(data);

    // Title 매핑 (customFields...facility[current].sections[0].about.title, 없으면 fallback)
    var titleEl = document.querySelector('.con4 .title');
    if (titleEl) {
      var aboutTitle = null;
      if (currentFacility && data.homepage && data.homepage.customFields && data.homepage.customFields.pages && data.homepage.customFields.pages.facility) {
        var customFacility = data.homepage.customFields.pages.facility.find(function(f) { return f.id === currentFacility.id; });
        if (customFacility && customFacility.sections && customFacility.sections[0] && customFacility.sections[0].about && customFacility.sections[0].about.title) {
          aboutTitle = customFacility.sections[0].about.title;
        }
      }

      titleEl.textContent = (aboutTitle && aboutTitle.trim()) ? aboutTitle : '준비된 특별함';
    }

    // SubTitle 매핑 (부대시설명 #태그, 최대 3개)
    var subTitle = document.querySelector('.con4 .subTitle');
    if (subTitle) {
      subTitle.innerHTML = '';
      facilities.slice(0, 3).forEach(function(facility) {
        if (facility && facility.name) {
          var tag = document.createElement('div');
          tag.className = 'tag';
          tag.textContent = '#' + facility.name;
          subTitle.appendChild(tag);
        }
      });
    }
  },

  // 시설 네비게이션 (동적 메뉴 생성)
  mapFacilityNavigation: function(data) {
    var facilities = (data && data.property && data.property.facilities) || [];
    var navList = document.querySelector('[data-facility-nav-list]');

    if (!navList) return;

    // 기존 li 모두 제거
    navList.innerHTML = '';

    var currentFacility = this.getCurrentFacility(data);

    facilities.forEach(function(facility) {
      var li = document.createElement('li');
      if (currentFacility && facility.id === currentFacility.id) {
        li.className = 'active';
      }

      var link = document.createElement('a');
      link.href = 'facility.html?facility_id=' + facility.id;
      link.textContent = facility.name || '';

      li.appendChild(link);
      navList.appendChild(li);
    });
  }
};