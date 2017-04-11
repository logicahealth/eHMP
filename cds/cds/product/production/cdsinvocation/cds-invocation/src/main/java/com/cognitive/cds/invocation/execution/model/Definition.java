package com.cognitive.cds.invocation.execution.model;

public class Definition {

	private String expression;

	private String scope;

	private String _id;

	private String description;

	private String name;

	private String owner;

	private String date;

	/**
	 *
	 * @return
	 */
	public String getExpression() {
		return expression;
	}

	/**
	 *
	 * @param expression
	 */
	public void setExpression(String expression) {
		this.expression = expression;
	}

	/**
	 *
	 * @return
	 */
	public String getScope() {
		return scope;
	}

	/**
	 *
	 * @param scope
	 */
	public void setScope(String scope) {
		this.scope = scope;
	}

	/**
	 *
	 * @return
	 */
	public String get_id() {
		return _id;
	}

	/**
	 *
	 * @param _id
	 */
	public void set_id(String _id) {
		this._id = _id;
	}

	/**
	 *
	 * @return
	 */
	public String getDescription() {
		return description;
	}

	/**
	 *
	 * @param description
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 *
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 *
	 * @param name
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 *
	 * @return
	 */
	public String getOwner() {
		return owner;
	}

	/**
	 *
	 * @param owner
	 */
	public void setOwner(String owner) {
		this.owner = owner;
	}

	/**
	 *
	 * @return
	 */
	public String getDate() {
		return date;
	}

	/**
	 *
	 * @param date
	 */
	public void setDate(String date) {
		this.date = date;
	}

	@Override
	public String toString() {
		return "ClassPojo [expression = " + expression + ", scope = " + scope
		        + ", _id = " + _id + ", description = " + description
		        + ", name = " + name + ", owner = " + owner + ", date = "
		        + date + "]";
	}
}
