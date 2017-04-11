package us.vistacore.ehmp.model.allergies;

/**
 * This class represents the product information in an allergy result.
 *
 * @author Les.Westberg
 *
 */
public class Product {
    private String name;
    private String vuid;

    /**
     * Default constructor.
     */
    public Product() {
        super();
    }

    /**
     * Return the name of the product.
     *
     * @return The name of the product.
     */
    public String getProductsName() {
        return name;
    }

    /**
     * Set the name of the product.
     *
     * @param productsName
     *            The name of the product.
     */
    public void setProductsName(String productsName) {
        this.name = productsName;
    }

    /**
     * Return the VUID for this product.
     *
     * @return The VUID for this product.
     */
    public String getProductsVuid() {
        return vuid;
    }

    /**
     * Set the VUID for this product.
     *
     * @param productsVuid
     *            The VUID for this product.
     */
    public void setProductsVuid(String productsVuid) {
        this.vuid = productsVuid;
    }
}
