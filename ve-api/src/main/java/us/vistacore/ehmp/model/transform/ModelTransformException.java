package us.vistacore.ehmp.model.transform;

/**
 * This is exception is used whenever there is a an exception that occurs when
 * doing model instance transformations.
 *
 * @author Les.Westberg
 */
public class ModelTransformException extends Exception {
    private static final long serialVersionUID = 1L;

    /**
     * Default constructor.
     */
    public ModelTransformException() {
        super();
    }

    /**
     * Constructor with an envloping exception.
     *
     * @param ex
     *            The exception that caused this one.
     */
    public ModelTransformException(Exception ex) {
        super(ex);
    }

    /**
     * Constructor with the given exception and message.
     *
     * @param message
     *            The message to place in the exception.
     * @param ex
     *            The exception that triggered this one.
     */
    public ModelTransformException(String message, Exception ex) {
        super(message, ex);
    }

    /**
     * Constructor with a given message.
     *
     * @param message
     *            The message for the exception.
     */
    public ModelTransformException(String message) {
        super(message);
    }
}
