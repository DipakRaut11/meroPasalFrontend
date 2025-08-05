import React from 'react';

const ProductTable = ({ products, onEdit, onDelete, onImageDelete }) => {
  console.log("Products in ProductTable:", products);
  return (
    <div className="product-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.brand}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>
                  <button onClick={() => onEdit(product)}>Edit</button>
                  <button onClick={() => onDelete(product.id)}>Delete</button>
                  <ul>
                  {product.images?.map((image, index) => {
                    // const key = `${product.id || 'no-id'}-${image.id || image.url || index}`;
                    // console.log("Image Key:", key);
                    return (
                      <li key = {index}>
                        <img src={image.url} alt={product.name} width="50" />
                        <button onClick={() => onImageDelete(product.id, image.id)}>Delete Image</button>
                      </li>
                    );
                  })}

                  </ul>
                </td>


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
