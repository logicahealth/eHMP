package gov.va.jbpm.entities.util;

import java.util.List;

import gov.va.jbpm.entities.util.TaskRouteImplUtil;

import static org.junit.Assert.*;

import org.junit.Test;
import gov.va.jbpm.entities.impl.TaskRouteImpl;

public class TaskRouteImplUtilTest {
	
	@Test
	public void testRouteCreate_Empty() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "");
		assertEquals(0, taskRoutes.size());
	}
	
	@Test
	public void testRouteCreate_FromOrder() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "[TF: Primary Care(11)/TR:Physician: (39)]");
		assertEquals(1, taskRoutes.size());
		assertEquals(11, taskRoutes.get(0).getTeamFocus());
		assertEquals(39, taskRoutes.get(0).getTeamRole());
	}
	
	@Test
	public void testRouteCreate_OnlyUserId() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "bpmsAdmin");
		assertEquals(1, taskRoutes.size());
		assertEquals("bpmsAdmin", taskRoutes.get(0).getUserId());
	}

	@Test
	public void testRouteCreate_OnlyRoute() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "[TF: Primary Care(104)/TR:Nurse Practitioner (93)/TM:Team 99(99)]");
		assertEquals( 1, taskRoutes.size());
		assertEquals(104, taskRoutes.get(0).getTeamFocus());
		assertEquals(93, taskRoutes.get(0).getTeamRole());
		assertEquals(99, taskRoutes.get(0).getTeam());
	}

	
	@Test
	public void testRouteCreate_MultipleRoutes() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "[FC:Kodak(C877)/TT:Primary Care Team A 3rd Floor(501)],[TF: Primary Care(104)/TR:Nurse Practitioner (93)]");
		assertEquals(2, taskRoutes.size());
		assertEquals("C877", taskRoutes.get(0).getFacility());
		assertEquals(501, taskRoutes.get(0).getTeamType());
		assertEquals(104, taskRoutes.get(1).getTeamFocus());
		assertEquals(93, taskRoutes.get(1).getTeamRole());
		assertNull(taskRoutes.get(1).getUserId());
	}

	@Test
	public void testRouteCreate_RouteAndUserId() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "[FC:Panorama(9E7A)/TT:Primary Care Team A 3rd Floor(501)],bpmsAdmin");
		assertEquals(2, taskRoutes.size());
		assertEquals("9E7A", taskRoutes.get(0).getFacility());
		assertEquals(501, taskRoutes.get(0).getTeamType());
		assertEquals("bpmsAdmin", taskRoutes.get(1).getUserId());
	}
	
	@Test
	public void testRouteCreate_RouteWithPAAndUserId() {
		List<TaskRouteImpl> taskRoutes = TaskRouteImplUtil.create(1, "[FC:Panorama(9E7A)/TT:Primary Care Team A 3rd Floor(501)/PA:Patient Assignment(1)],bpmsAdmin");
		assertEquals(2, taskRoutes.size());
		assertEquals("9E7A", taskRoutes.get(0).getFacility());
		assertEquals(501, taskRoutes.get(0).getTeamType());
		assertEquals(true, taskRoutes.get(0).getPatientAssignment());
		assertEquals("bpmsAdmin", taskRoutes.get(1).getUserId());
	}

}
