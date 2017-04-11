package us.vistacore.ehmp.model.allergies;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;

/**
 * This tests the Allergies Product class.
 *
 * @author Les.Westberg
 *
 */
public class ProductTest {
    private static final String PRODUCT_NAME_VALUE = "TheProductName";
    private static final String PRODUCT_VUID_VALUE = "TheProductVuid";
    Product testSubject = null;

    /**
     * This method is run before each test is run to set up state.
     *
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception {
        testSubject = new Product();
    }

    /**
     * This tests the productsName property.
     */
    @Test
    public void testProductsName() {
        testSubject.setProductsName(PRODUCT_NAME_VALUE);
        assertEquals("ProductsName property was not set correctly.", PRODUCT_NAME_VALUE, testSubject.getProductsName());
    }

    /**
     * This tests the productsVuid property.
     */
    @Test
    public void testProductsVuid() {
        testSubject.setProductsVuid(PRODUCT_VUID_VALUE);
        assertEquals("ProductsVuid property was not set correctly.", PRODUCT_VUID_VALUE, testSubject.getProductsVuid());
    }

    /**
     * This method tests setting all properties and verifying that they are set correctly.  It
     * makes sure that each property stands alone.  (No method property misusing another properties
     * underlying storage field.)
     */
    @Test
    public void testAllProperties() {
        testSubject.setProductsName(PRODUCT_NAME_VALUE);
        testSubject.setProductsVuid(PRODUCT_VUID_VALUE);
        assertEquals("ProductName failed.", PRODUCT_NAME_VALUE, testSubject.getProductsName());
        assertEquals("ProductVuid failed.", PRODUCT_VUID_VALUE, testSubject.getProductsVuid());
    }
}
