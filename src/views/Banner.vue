<template>
  <div>
    <b-carousel
      id="carousel-1"
      v-model="slide"
      :interval="4000"
      controls
      background="#ababab"
      style="text-shadow: 1px 1px 2px #333"
      @sliding-start="onSlideStart"
      @sliding-end="onSlideEnd"
    >
      <!-- Slides with img slot -->
      <!-- Note the classes .d-block and .img-fluid to prevent browser default image alignment -->
      <b-carousel-slide
        v-for="item in listData"
        :key="item.id"
      >
        <template #img>          
          <span @click="redirectToDetail(item)">
            <img
              v-if="item.images.length > 0"
              :src="createImageURL(item.images[0].full_original_url)"
              alt="Image description"
              class="h-100 w-100"
            />            
        </span>
        </template>
      </b-carousel-slide>
    </b-carousel>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { RootAPI } from '../api/index';

export default {
    layout: 'main',
    name: 'Banner',
    props: {
        isGoToDetail: {
            type: Boolean,
            required: true
        },
        storeCode: {
            type: String,
            required: true
        },
        brandCode: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            slide: 0,
            sliding: null
        };
    },
    computed: {
        ...mapGetters({
            listData: 'banner/banners'
        })
    },
    async mounted() {
        let data = {};
        // if (this.storeCode != null && this.storeCode != '') {
        //     data.store_code = this.storeCode;
        // }
        if (this.brandCode != null && this.brandCode != '') {
            data.brand_code = this.brandCode;
        }
        await this.$store.dispatch('banner/getListBanner', data);
    },
    methods: {
        onSlideStart(slide) {
            this.sliding = true;
        },
        onSlideEnd(slide) {
            this.sliding = false;
        },
        redirectToDetail(banner) {
            if (banner.product_code != null && banner.product_code != 'null') {
                const [
                    categoryCode,
                    classCode,
                    productCode
                ] = banner.product_code.split('-');
                if (this.isGoToDetail) {
                    this.$router.push({
                        path: '/detail',
                        query: { product_code: productCode }
                    });
                }
                return;
            } else {
                return window.open(banner.redirect_url);
            }
        },
      createImageURL(baseURL) {
        const width = window.innerWidth;
        let imageURLTmp = baseURL.substring(1, baseURL.length);

        if (width < 600) {
          // Điện thoại
          imageURLTmp = '/revive-mobile.png';
        } else if (width < 1200) {
          // Máy tính bảng:
          imageURLTmp = '/revive-banner.png';
        } else {
          // Máy tính xách tay hoặc máy tính để bàn: Cũng lấy ảnh thứ 1
          //imageURLTmp  = RootAPI + 'v2/' + imageURLTmp;
          imageURLTmp = '/revive-banner.png';
        }
        return imageURLTmp;
      }
    }
};
</script>
