package vistacore.order.discharge;

import org.junit.Test;

import vistacore.order.discharge.util.DischargeHelperUtil;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;

public class DischargeHelperUtilTest {

	/*
	 * Start tests for createDischargeFromVprData
	 */

	@Test
	public void createDischargeFromEmptyVprData() {
		DischargeVprData data = new DischargeVprData();

		Discharge result = DischargeHelperUtil.createDischargeFromVprData(data);
		assertEquals(result.getDisposition(), null);
		assertEquals(result.getDiagnosis().isEmpty(), true);
	}

	@Test
	public void testDischargeDispositionRecency() {
		DischargeVprData data = new DischargeVprData();

		// Prepare movements
		List<Movement> movements = new ArrayList<Movement>();

		Movement oldDischarge = new Movement();
		oldDischarge.setMovementType(DischargeHelperUtil.DISCHARGE_MOVEMENT);
		oldDischarge.setMovementSubType("oldDischarge");
		oldDischarge.setDateTime("20170630000000");
		movements.add(oldDischarge);

		Movement newDischarge = new Movement();
		newDischarge.setMovementType(DischargeHelperUtil.DISCHARGE_MOVEMENT);
		newDischarge.setMovementSubType("newDischarge");
		newDischarge.setDateTime("20170710000000");
		movements.add(newDischarge);

		Movement newNonDischarge = new Movement();
		newNonDischarge.setMovementType("Non".concat(DischargeHelperUtil.DISCHARGE_MOVEMENT));
		newNonDischarge.setMovementSubType("newerButNotDischarge");
		newNonDischarge.setDateTime("20170715000000");
		movements.add(newNonDischarge);

		data.setMovements(movements);

		Discharge result = DischargeHelperUtil.createDischargeFromVprData(data);
		assertEquals(result.getDisposition(), "newDischarge");
	}

	@Test
	public void testRegularDischargeDispositionIsEmpty() {
		DischargeVprData data = new DischargeVprData();

		List<Movement> movements = new ArrayList<Movement>();

		Movement oldDischarge = new Movement();
		oldDischarge.setMovementType(DischargeHelperUtil.DISCHARGE_MOVEMENT);
		oldDischarge.setMovementSubType("notRegular");
		oldDischarge.setDateTime("20170630000000");
		movements.add(oldDischarge);

		Movement newDischarge = new Movement();
		newDischarge.setMovementType(DischargeHelperUtil.DISCHARGE_MOVEMENT);
		newDischarge.setMovementSubType(DischargeHelperUtil.MOVEMENT_SUBTYPE_REGULAR);
		newDischarge.setDateTime("20170710000000");
		movements.add(newDischarge);

		data.setMovements(movements);

		Discharge result = DischargeHelperUtil.createDischargeFromVprData(data);
		assertEquals(result.getDisposition(), "");
	}

	@Test
	public void testDiagnosisPrimary() {
		DischargeVprData data = new DischargeVprData();

		String primaryDescription = "ketoacidosis";
		String primaryCode = "abc123";

		data.setPrimaryDiagnosis(primaryDescription);
		data.setPrimaryDiagnosisCode(primaryCode);

		Discharge result = DischargeHelperUtil.createDischargeFromVprData(data);
		assertEquals(result.getDiagnosis().size(), 1);
		assertEquals(result.getDiagnosis().get(0).getDescription(), primaryDescription);
		assertEquals(result.getDiagnosis().get(0).getCode(), primaryCode);
	}

	@Test
	public void testDiagnosisSecondary() {
		DischargeVprData data = new DischargeVprData();

		List<Diagnosis> secondaryDiagnoses = new ArrayList<Diagnosis>();

		Diagnosis badDiagnosis = new Diagnosis(null, "badCode", "badDescrip");
		Diagnosis goodDiagnosis = new Diagnosis(null, "goodCode", "goodDescrip");

		secondaryDiagnoses.add(badDiagnosis);
		secondaryDiagnoses.add(goodDiagnosis);

		data.setSecondaryDiagnoses(secondaryDiagnoses);

		Discharge result = DischargeHelperUtil.createDischargeFromVprData(data);
		assertEquals(result.getDiagnosis().size(), 2);
	}

	/*
	 * End tests for createDischargeFromVprData
	 */
}