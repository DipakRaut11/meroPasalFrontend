class Product {
    constructor(data) {
      this.id = data.id;
      this.name = data.name || '';
      this.brand = data.brand || '';
      this.price = data.price || 0;
      this.inventory = data.inventory || 0;
      this.description = data.description || '';
      this.category = data.category ? {
        id: data.category.id,
        name: data.category.name
      } : null;
      
      this.images = (data.images || []).map(img => ({
        id: img.imageId || img.id,
        fileName: img.imageName || img.fileName,
        viewUrl: `${IMAGE_API}/images/view/${img.imageId || img.id}`,
        downloadUrl: `${IMAGE_API}/images/download/${img.imageId || img.id}`
      }));
    }
  
    getFormData() {
      return {
        name: this.name,
        brand: this.brand,
        price: this.price,
        inventory: this.inventory,
        description: this.description,
        category: this.category?.name || ''
      };
    }
  }
  
  export default Product;