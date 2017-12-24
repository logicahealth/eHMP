package vistacore.hibernate.dialect;

import java.sql.Types;

import org.hibernate.dialect.Oracle10gDialect;
import org.hibernate.type.StandardBasicTypes;

public class H2OracleDialect extends Oracle10gDialect {
	
	public H2OracleDialect() {
		super();
		registerHibernateType( Types.BIGINT, StandardBasicTypes.BIG_DECIMAL.getName() );
	}

}
