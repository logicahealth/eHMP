/**
 * Copyright 2011 - 2015 OpenCDS.org
 *	Licensed under the Apache License, Version 2.0 (the "License");
 *	you may not use this file except in compliance with the License.
 *	You may obtain a copy of the License at
 *
 *		http://www.apache.org/licenses/LICENSE-2.0
 *
 *	Unless required by applicable law or agreed to in writing, software
 *	distributed under the License is distributed on an "AS IS" BASIS,
 *	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	See the License for the specific language governing permissions and
 *	limitations under the License.
 *	
 */

package org.opencds.support.guvnor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.opencds.common.utilities.DateUtility;
import org.opencds.vmr.v1_0.internal.AdministrableSubstance;
import org.opencds.vmr.v1_0.internal.ClinicalStatement;
import org.opencds.vmr.v1_0.internal.ClinicalStatementRelationship;
import org.opencds.vmr.v1_0.internal.EncounterEvent;
import org.opencds.vmr.v1_0.internal.ObservationResult;
import org.opencds.vmr.v1_0.internal.ObservationValue;
import org.opencds.vmr.v1_0.internal.Problem;
import org.opencds.vmr.v1_0.internal.ProcedureEvent;
import org.opencds.vmr.v1_0.internal.SubstanceAdministrationEvent;
import org.opencds.vmr.v1_0.internal.SubstanceDispensationEvent;
import org.opencds.vmr.v1_0.internal.concepts.EncounterTypeConcept;
import org.opencds.vmr.v1_0.internal.concepts.ProcedureConcept;
import org.opencds.vmr.v1_0.internal.concepts.VmrOpenCdsConcept;
import org.opencds.vmr.v1_0.internal.datatypes.CD;
import org.opencds.vmr.v1_0.internal.datatypes.INT;
import org.opencds.vmr.v1_0.internal.datatypes.IVLDate;
import org.opencds.vmr.v1_0.internal.datatypes.PQ;

/**
 * <p>Assorted methods designed to be used from DSLs and within DRLs.
 * <p/>
 *
 * @authors Kensaku Kawamoto, David Shields, Polina Kukhareva
 * @version 1.00
 */

public class GuvnorFunctionWorkup {
	
	
	/** addNamedListIncrementally
	 * @param name
	 * @param newItems
	 * @param namedObjects
	 * @return
	 */
	public static boolean addNamedListIncrementally(String name, List newItems, Map namedObjects) 
//	/* function to add a named object in the LHS of a rule, must always return a boolean true 
//	 * will create the list in namedObjects if it does not already exist,
//	 * will add to the list in namedObjects if it does already exist
//	 * */
	{
		List existingItems = (List)namedObjects.get(name);
		if (existingItems != null) {
			existingItems.add(newItems);
			namedObjects.put(name, existingItems);
		}
		return true;
	}
	
	
	
	/** addNamedObject
	 * @param name
	 * @param value
	 * @param namedObjects
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static boolean addNamedObject(String name, Object value, @SuppressWarnings("rawtypes") Map namedObjects) 
//	/* function to add a named object in the LHS of a rule, must always return a boolean true */
	{
		namedObjects.put(name, value);
		return true;
	}
	
	
	/** addToNamedObject_DateStringToIVLDateListMap
	 * @param mapNameInNamedObjects
	 * @param highLow
	 * @param dateFormat
	 * @param ivlDateList
	 * @param namedObjects
	 * @return boolean always true
	 */
	@SuppressWarnings("unchecked")
	public static boolean addToNamedObject_DateStringToIVLDateListMap (
			String mapNameInNamedObjects, 
			String highLow,  
			String dateFormat, 
			@SuppressWarnings("rawtypes") java.util.List ivlDateList, 
			@SuppressWarnings("rawtypes") java.util.HashMap namedObjects)
//	/*
//	 * Inputs:
//	 * namedObjectKeyForEncounterDateMap: the key to namedObjects which contains the encounterDateMap.  
//	 * The encounterDateMap is a map where the key is date string, format yyyyMMdd, representing the encounter low date,
//	 *      and the value is the IVLDate that represents the low and high values of the encounterEventTime.  If there are
//	 *      multiple encounters with the same low date, the one with the latest high value will be included.
//	 *      --> Note that there may be IVLDates with different start dates, that still overlap due to the end dates. 
//	 * encounterEventList: list of EncounterEvents of interest.  May be null.
//	 * namedObjects: global namedObjects.  Must not be null.     
//	 *      
//	 * It is up to the process that uses this list to determine whether the starting and ending times of entries overlap.
//	 * 
//	 * The function always returns a value of true.
//	 */
	{
			java.util.Map<String, java.util.List<IVLDate>> map = null;
			
			if (namedObjects.get(mapNameInNamedObjects) == null) {
				/* doesn't exist, so create it */
				map = new HashMap<String, java.util.List<IVLDate>>();
				
			} else {
				/* does exist, so get it... */
				map = (java.util.Map<String, java.util.List<IVLDate>>) namedObjects.get(mapNameInNamedObjects);
			}
			
			/* loop through the IVLDate list and process */
			if ((ivlDateList != null) && (ivlDateList.size() > 0))
			{
				for (IVLDate ivlDate : (java.util.List<IVLDate>) ivlDateList) {
						
					/*  create a date string */
					String date = "";

					if (("High".equals(highLow)) && (ivlDate.getHigh() != null))
					{
						date = org.opencds.common.utilities.DateUtility.getInstance().getDateAsString(ivlDate.getHigh(), dateFormat);
					}
					else if (("Low".equals(highLow)) && (ivlDate.getLow() != null))
					{
						date = org.opencds.common.utilities.DateUtility.getInstance().getDateAsString(ivlDate.getLow(), dateFormat);
					}
					else 
					{
						continue;	//skip this ivlDate; unusable
					}
					
					/* use it for the key into the HashMap, and look for existing target */
					java.util.List<IVLDate> targetIvlDateList = (java.util.List<IVLDate>) map.get(date);
					
					/* initialize list if null
					 */
					if (targetIvlDateList == null)
					{
						targetIvlDateList = new java.util.ArrayList<IVLDate>();
					}
					
					/* add ivlDate to list
					*/
					targetIvlDateList.add(ivlDate);
					
					/* place list into map
					*/
					map.put(date, targetIvlDateList);						
				}

				/* create the map entry if it is NOT null... */
				namedObjects.put(mapNameInNamedObjects, map);
			}
			
			return true;
		}
	
	
	
	/** countDistinctDates
	 * @param dateList
	 * @return int representing the number of distinct dates present in a list of dates, ignoring time values
	 */
	@SuppressWarnings("unchecked")
	public static int countDistinctDates(@SuppressWarnings("rawtypes") java.util.List dateList) 
	{
//	/* 
//	Returns number of distinct dates are in dateList.  I.e., counts number of entries that are on different days while ignoring hours, minutes, and seconds.
//
//	Returns 0 if list is null or empty.
//
//	*/

		// System.out.println(">>> dateList: " + dateList.toString());

		if (dateList == null)
		{
			return 0;
		}

//		// this list contains only dates which have different dates (regardless of hours, minutes and seconds) compared to other dates already included
//		java.util.ArrayList<java.util.Date> distinctDateList = new java.util.ArrayList<java.util.Date>();
//
//		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
//	
//		for (java.util.Date date : (java.util.List<java.util.Date>) dateList)
//		{
//			boolean dateAlreadyIncluded = false;
//			for (java.util.Date distinctDateAlreadyInList : distinctDateList)
//			{
//				if(dateUtility.isSameDay(date, distinctDateAlreadyInList))
//				{
//					dateAlreadyIncluded = true;
//				}
//			}
//			if (! dateAlreadyIncluded)
//			{
//				distinctDateList.add(date);
//			}
//		}
		

		// this HashSet contains only dates which have different dates (regardless of hours, minutes and seconds) compared to other dates already included
		
		java.util.HashSet<java.util.Date> distinctDateList = new java.util.HashSet<java.util.Date>();

		for (java.util.Date date : (java.util.List<java.util.Date>) dateList)
		{
			distinctDateList.add(stripTimeComponent(date));
		}
		
		return distinctDateList.size();
	}		
	
	/** countDaysSuppliedBySubstanceDispensations
	 * @param substanceDispensationEvents
	 * @param lowDateComparisonOperator
	 * @param lowDate
	 * @param highDateComparisonOperator
	 * @param highDate
	 * @return int representing the count calculated by the function
	 */
	@SuppressWarnings("unchecked")
	public static int countDaysSuppliedBySubstanceDispensations(
			@SuppressWarnings("rawtypes") List substanceDispensationEvents, 
			String lowDateComparisonOperator, 
			Date lowDate, 
			String highDateComparisonOperator, 
			Date highDate) 
	{
//	/* 
//	Pre-conditions:
//	- lowDate and highDate must be non-null, and highDate must be after lowDate.  Returns 0 if these conditions are not met.
//	- lowDateComparisonOperator must be ">" or ">=".  Prints error and assumes ">=" if other value provided.
//	- highDateComparisonOperator must be "<" or "<=".  Prints error and assumes "<=" if other value provided.
//
//	Returns the number of days that are > or >= lowDate and < or <= highDate which were supplied by the substance dispensations.
//
//	Use of >, >=, <, or <= are determiend by the comparison operators.  The lowDateComparisonOperator msut be > or >=, and the highDateComparisonOperator must be < or <=.  They will be assumed to be >= and <= if an invalide value is specified.
//
//	Ignores time components (hours, minutes, seconds, milliseconds) of the date intervals for the purposes of the comparison.
//
//	The dates requiring coverage are specified as lowDate - highDate (inclusive or exclusive depending on operator).  E.g., if lowDate = 1/1/2011 and highDate = 6/1/2011, and operators are >= and <=, then each day between andincluding 1/1/2011 and 6/1/2011 will be considered to require coverage.
//
//	For each of the days in this interval, the day will be considered supplied as follows:
//	- Start with substance dispensation low time.
//	- Consider that days supplied to be low time + (daysSupply - 1).  E.g., if dispensation low time = 2/1/2011 and daysSupply = 30, consider days 2/1/2011 to 2/1/2011 + 30 - 1 = 2/30/2011 to be supplied.
//
//	*/
		if ((lowDate == null) || (highDate == null) || (lowDate.after(highDate)))
		{
			return 0;
		}
		
		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
		
		// Determine low and high bounds for checking for substance dispensation coverage.  Define these dates with no time components.	
		Date lowDateInclusive = null;
		Date highDateInclusive = null;
		
		if (lowDateComparisonOperator.equals(">="))
		{
			lowDateInclusive =  stripTimeComponent(lowDate);
		}
		else if (lowDateComparisonOperator.equals(">"))
		{
			lowDateInclusive = dateUtility.getDateAfterAddingTime(stripTimeComponent(lowDate), java.util.Calendar.DATE, 1);
		}
		else
		{
			System.err.println(">>> Error in Function countDaysSuppliedBySubstanceDispensations.  lowDateComparisonOperator of " + lowDateComparisonOperator + " not recognized.  Proceeding with use of >= as operator.");
			lowDateInclusive = stripTimeComponent(lowDate);
		}
		
		if (highDateComparisonOperator.equals("<="))
		{
			highDateInclusive = stripTimeComponent(highDate);
		}
		else if (highDateComparisonOperator.equals("<"))
		{
			highDateInclusive = dateUtility.getDateAfterAddingTime(stripTimeComponent(highDate), java.util.Calendar.DATE, -1);
		}
		else
		{
			System.err.println(">>> Error in Function countDaysSuppliedBySubstanceDispensations.  highDateComparisonOperator of " + highDateComparisonOperator + " not recognized.  Proceeding with use of <= as operator.");
			highDateInclusive = stripTimeComponent(highDate);
		}
		
		// create a HashMap<String, Boolean> where key = String of day reuqiring coverage in yyyy-MM-dd format, target = Boolean of whether that day was covered
		// create a parallel HashSet<String> containing the keys
		
		HashMap<String, Boolean> daysRequiringCoverageToCoveredMap = new HashMap<String, Boolean>();
		HashSet<String> daysRequiringCoverage = new HashSet<String>();
		
		Date dateRequiringCoverage = new Date(lowDateInclusive.getTime());
		while(! dateRequiringCoverage.after(highDateInclusive))
		{
			String dateRequringCoverageAsString = dateUtility.getDateAsString(dateRequiringCoverage, "yyyy-MM-dd");
			daysRequiringCoverage.add(dateRequringCoverageAsString);
			daysRequiringCoverageToCoveredMap.put(dateRequringCoverageAsString, new Boolean(false));
			dateRequiringCoverage = dateUtility.getDateAfterAddingTime(dateRequiringCoverage, java.util.Calendar.DATE, 1);
		}
		
		// for each substance dispensation event, iterate through each day requiring coverage and mark that date as covered as indicated
		
		for (SubstanceDispensationEvent subDispense : (List<SubstanceDispensationEvent>) substanceDispensationEvents)
		{
			IVLDate subDispenseTime = subDispense.getDispensationTime();	
			if (subDispenseTime != null)
			{		
				Date subDispenseLowDate = stripTimeComponent(subDispenseTime.getLow());			
				INT daysSupplyINT = subDispense.getDaysSupply();
				if ((subDispenseLowDate != null) && (daysSupplyINT != null))
				{
					Date dayCovered = new Date(subDispenseLowDate.getTime());
					int daysSupply = daysSupplyINT.getValue();
					for (int k = 0; k < daysSupply; k++)
					{
						String dayCoveredAsString = dateUtility.getDateAsString(dayCovered, "yyyy-MM-dd");
						dayCovered = dateUtility.getDateAfterAddingTime(dayCovered, java.util.Calendar.DATE, 1);
						
						if(daysRequiringCoverage.contains(dayCoveredAsString))
						{
							daysRequiringCoverageToCoveredMap.put(dayCoveredAsString, new Boolean(true));
						}
					}
				}
			}
		}
		
		// count number of days requiring coverage that were actually covered and return it
		int countDaysCovered = 0;
		for (String dayNeedingCoverage : daysRequiringCoverage)
		{
			boolean covered = (daysRequiringCoverageToCoveredMap.get(dayNeedingCoverage)).booleanValue();
			if (covered)
			{
				countDaysCovered++;
			}
		}
		return countDaysCovered;
	}	
	

	/**
	 * @param dateList
	 * @param numberOf
	 * @param timeUnits
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static int countSeparatedDateTimes(@SuppressWarnings("rawtypes") java.util.List dateList, int numberOf, int timeUnits) 
	{
//	/* 
//	Returns number of dateTimes in dateList with the specified linear separation.  
//	I.e., counts number of entries that follow a previous entry by the specified separation value ignoring timeUnits smaller than the separation value.
//
//	Returns 0 if list is null or empty.
//
//	*/

		if (dateList == null) {
			return 0;
		}
		if (dateList.size() == 0) {
			return 0;
		}
		
		//System.out.println(">>> countSeparatedDateTimes(dateList): " + dateList.toString());

		// this list contains only dates which have different dates (regardless of hours, minutes and seconds) compared to other dates already included;
		java.util.ArrayList<java.util.Date> separatedDateList = new java.util.ArrayList<java.util.Date>();

		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
		
		// sort the input datelist;
		java.util.Collections.sort((java.util.List<java.util.Date>)dateList);
		
		for ( int i = 0; i < dateList.size(); i++ )
		{	
			java.util.Date thisDate = (java.util.Date)dateList.get(i);		
			if (i > 0) {
				java.util.Date prevDate = (java.util.Date)dateList.get(i -1);
				java.util.Date prevDateAdjusted = dateUtility.getDateAfterAddingTime(prevDate, numberOf, timeUnits);
				if (prevDateAdjusted.compareTo(thisDate) <= 0) {
				separatedDateList.add(thisDate);
				}
				
			} else {
				separatedDateList.add(thisDate); //count the very first date because it has no dates before it
			}
		}
		//System.out.println(">>> countSeparatedDateTimes(separatedDateList): " + separatedDateList.toString());
		return separatedDateList.size();
	}		
	
	
	/** countSubstanceDispensationEventsDefinedByHEDISASM
	 * @param oralSubstanceDispensationEvents
	 * @param inhalerSubstanceDispensationEvents
	 * @param injectionSubstanceDispensationEvents
	 * @param daysSupplyThreshold
	 * @param highLow
	 * @return count
	 */
	@SuppressWarnings("unchecked")
	public static int countSubstanceDispensationEventsDefinedByHEDISASM(
			@SuppressWarnings("rawtypes") java.util.List oralSubstanceDispensationEvents, 
			@SuppressWarnings("rawtypes") java.util.List inhalerSubstanceDispensationEvents, 
			@SuppressWarnings("rawtypes") java.util.List injectionSubstanceDispensationEvents, 
			int daysSupplyThreshold, 
			String highLow)  
//	/*
//	Returns the number of substance dispensation events as defined by HEDIS ASM, 2014.
//	
//	Specifically, does the following:
//	- Oral dispensing events:
//	First, create a map where key = String yyyy-MM-dd of the date, target = List<SubstanceDispensationEvent>
//	
//	Iterate through the different dates (keys of the map) and add up the following counts
//	
//	if (target list only has one entry)
//	{
//		Get daysSupply
//		Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger		
//	}
//	else
//	{
//		Initialize a HashSet<String> of medicationTypes that have been processed (where medicationType = codeSystem + code + originalText)
//		Iterate through list of substance dispensation events
//		if (medicationType has not been processed)
//		{
//			mark medicationType as having been processed
//			iterate through list and sum up the daysSupply for all substanceDispensationEvents with that medicationType
//			Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger
//		}		
//	}	
//	
//	- Inhaler dispensing events:
//	Count number of distinct dates
//	
//	- Injection dispensing events:
//	Get list size (number of dispensation events)
//	
//	Then add all of these sub-counts together
//	
//	Inputs required:
//	- The three SubstanceDispensationEvent lists -- if contains any data, must contain SubstanceDispensationEvents.  May be null or empty.  Whether a drug is the same or different is identified through a concatenation of the substance's codeSystem, code, and originalText.  
//	- daysSupplyThreshold -- used for counting oral medication dispenation events, as described above
//	- highLow -- must be "High" or "Low", indicating which dispensation time to use 
//	*/
	{
		int countToReturn = 0;
		
		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance(); 
		
		// Process oral dispensing events:
		// First, create a map where key = String yyyy-MM-dd of the date, target = List<SubstanceDispensationEvent>
		java.util.Map<String, java.util.List<SubstanceDispensationEvent>> dateStrToDispListMap = new java.util.HashMap<String, java.util.List<SubstanceDispensationEvent>>();
		
		if (oralSubstanceDispensationEvents != null)
		{
			for (SubstanceDispensationEvent disp : (java.util.List<SubstanceDispensationEvent>) oralSubstanceDispensationEvents)
			{
				IVLDate dispIVLDate = disp.getDispensationTime();
				if (dispIVLDate != null)
				{
					java.util.Date dispDate = ((highLow != null) && (highLow.equals("High"))) ? dispIVLDate.getHigh() : dispIVLDate.getLow(); 
					if (dispDate != null)
					{
						String dispDateAsStr = dateUtility.getDateAsString(dispDate, "yyyy-MM-dd");
						if (dateStrToDispListMap.containsKey(dispDateAsStr))
						{
							java.util.List<SubstanceDispensationEvent> targetList = dateStrToDispListMap.get(dispDateAsStr);
							targetList.add(disp);
							// don't need to put back in map because already in there
						}
						else
						{
							java.util.List<SubstanceDispensationEvent> targetList = new java.util.ArrayList<SubstanceDispensationEvent>();
							targetList.add(disp);
							dateStrToDispListMap.put(dispDateAsStr, targetList);
						}
						
					}
				}
			}
		}
		
		// Iterate through the different dates (keys of the map) and add up the following counts
		
		java.util.Set<String> keySet = dateStrToDispListMap.keySet();
		
		for (String dateStr : keySet)
		{
			java.util.List<SubstanceDispensationEvent> targetList = dateStrToDispListMap.get(dateStr);
			// if target list has only one entry
			if (targetList.size() == 1)
			{
				// Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger	
				int countToAdd = 1;
				SubstanceDispensationEvent disp = targetList.get(0);
				INT daysSupply = disp.getDaysSupply();
				if (daysSupply != null)
				{
					if ((daysSupply.getValue()/daysSupplyThreshold) > 1)
					{
						countToAdd = daysSupply.getValue()/daysSupplyThreshold;
					}
				}
				countToReturn += countToAdd;
			}
			else if (targetList.size() >= 2) // if target list has 2+ entries
			{
				// Initialize a HashSet<String> of medicationTypes that have been processed
				java.util.Set<String> medTypesProcessed = new java.util.HashSet<String>();
			
				// Iterate through list of substance dispensation events
				for (SubstanceDispensationEvent disp : targetList)
				{
					AdministrableSubstance sub = disp.getSubstance();
					if (sub != null)
					{
						CD subCode = sub.getSubstanceCode();
						if (subCode != null)
						{
							String codeSystem = subCode.getCodeSystem();
							String code = subCode.getCode();							
							String originalText = subCode.getOriginalText();
							String medType = codeSystem + "^" + code + "^" + originalText;
							
							// if (medType has not been processed)
							if (! medTypesProcessed.contains(medType))
							{
								// Mark medTypeas having been processed
								medTypesProcessed.add(medType);
								
								// iterate through list and sum up the daysSupply for all substanceDispensationEvents with that medType
								int daysSupplyTotal = 0;
								for (SubstanceDispensationEvent disp2 : targetList)
								{
									AdministrableSubstance sub2 = disp2.getSubstance();
									if (sub2 != null)
									{
										CD subCode2 = sub2.getSubstanceCode();
										if (subCode2 != null)
										{
											String codeSystem2 = subCode2.getCodeSystem();
											String code2 = subCode2.getCode();							
											String originalText2 = subCode2.getOriginalText();
											String medType2 = codeSystem2 + "^" + code2 + "^" + originalText2;
											
											if (medType2.equals(medType))
											{
												INT daysSupply2 = disp2.getDaysSupply();
												if (daysSupply2 != null)
												{
													daysSupplyTotal += daysSupply2.getValue();
												}												
											}						
										}
									}
								}
								// Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger
								int countToAdd = 1;
								if ((daysSupplyTotal/daysSupplyThreshold) > 1)
								{
									countToAdd = daysSupplyTotal/daysSupplyThreshold;
								} 
								countToReturn += countToAdd;
							}						
						}
					}
				}				
			}
		}
		
		// Process inhaler dispensing events:
		// Count number of distinct dates
		if (inhalerSubstanceDispensationEvents != null)
		{
			java.util.Set<String> uniqueSubDispenseDateStrSet = new java.util.HashSet<String>();
			
			for (SubstanceDispensationEvent disp : (java.util.List<SubstanceDispensationEvent>) inhalerSubstanceDispensationEvents)
			{
				IVLDate dispIVLDate = disp.getDispensationTime();
				if (dispIVLDate != null)
				{
					java.util.Date dispDate = ((highLow != null) && (highLow.equals("High"))) ? dispIVLDate.getHigh() : dispIVLDate.getLow(); 
					String medId = disp.getSubstance().getSubstanceCode().getOriginalText();
					if ((dispDate != null) && (medId != null))
					{
						String dispDateAsStr = dateUtility.getDateAsString(dispDate, "yyyy-MM-dd");
						uniqueSubDispenseDateStrSet.add(dispDateAsStr + "^" + medId);	
					}
				}
			}
			countToReturn += uniqueSubDispenseDateStrSet.size();
		}
			
		// Process injection dispensing events:
		// Get list size (number of dispensation events)
		if (injectionSubstanceDispensationEvents != null)
		{
			countToReturn += injectionSubstanceDispensationEvents.size();
		}		
		
		return countToReturn;
	}
	
	
	/** countSubstanceDispensationUnitsDefinedByHEDISASM
	 * @param oralSubstanceDispensationEvents
	 * @param inhalerSubstanceDispensationEvents
	 * @param injectionSubstanceDispensationEvents
	 * @param daysSupplyThreshold
	 * @param highLow
	 * @return count
	 */
	@SuppressWarnings("unchecked")
	public static int countSubstanceDispensationUnitsDefinedByHEDISASM(
			@SuppressWarnings("rawtypes") java.util.List oralSubstanceDispensationEvents, 
			@SuppressWarnings("rawtypes") java.util.List inhalerSubstanceDispensationEvents, 
			@SuppressWarnings("rawtypes") java.util.List injectionSubstanceDispensationEvents, 
			int daysSupplyThreshold, 
			String highLow)  
//	/*
//	Returns the number of substance dispensation units as defined by HEDIS ASM, 2014.
//	
//	Specifically, does the following:
//	- Oral dispensing events:
//	First, create a map where key = String yyyy-MM-dd of the date, target = List<SubstanceDispensationEvent>
//	
//	Iterate through the different dates (keys of the map) and add up the following counts
//	
//	if (target list only has one entry)
//	{
//		Get daysSupply
//		Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger		
//	}
//	else
//	{
//		Initialize a HashSet<String> of medicationTypes that have been processed (where medicationType = codeSystem + code + originalText)
//		Iterate through list of substance dispensation events
//		if (medicationType has not been processed)
//		{
//			mark medicationType as having been processed
//			iterate through list and sum up the daysSupply for all substanceDispensationEvents with that medicationType
//			Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger
//		}		
//	}	
//	
//	- Inhaler dispensing events:
//	Count number of distinct dates
//	
//	- Injection dispensing events:
//	Get list size (number of dispensation events)
//	
//	Then add all of these sub-counts together
//	
//	Inputs required:
//	- The three SubstanceDispensationEvent lists -- if contains any data, must contain SubstanceDispensationEvents.  May be null or empty.  Whether a drug is the same or different is identified through a concatenation of the substance's codeSystem, code, and originalText.  
//	- daysSupplyThreshold -- used for counting oral medication dispenation events, as described above
//	- highLow -- must be "High" or "Low", indicating which dispensation time to use 
//	*/
	{
		int countToReturn = 0;
		
		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance(); 
		
		// Process oral dispensing events:
		// First, create a map where key = String yyyy-MM-dd of the date, target = List<SubstanceDispensationEvent>
		java.util.Map<String, java.util.List<SubstanceDispensationEvent>> dateStrToDispListMap = new java.util.HashMap<String, java.util.List<SubstanceDispensationEvent>>();
		
		if (oralSubstanceDispensationEvents != null)
		{
			for (SubstanceDispensationEvent disp : (java.util.List<SubstanceDispensationEvent>) oralSubstanceDispensationEvents)
			{
				IVLDate dispIVLDate = disp.getDispensationTime();
				if (dispIVLDate != null)
				{
					java.util.Date dispDate = ((highLow != null) && (highLow.equals("High"))) ? dispIVLDate.getHigh() : dispIVLDate.getLow(); 
					if (dispDate != null)
					{
						String dispDateAsStr = dateUtility.getDateAsString(dispDate, "yyyy-MM-dd");
						if (dateStrToDispListMap.containsKey(dispDateAsStr))
						{
							java.util.List<SubstanceDispensationEvent> targetList = dateStrToDispListMap.get(dispDateAsStr);
							targetList.add(disp);
							// don't need to put back in map because already in there
						}
						else
						{
							java.util.List<SubstanceDispensationEvent> targetList = new java.util.ArrayList<SubstanceDispensationEvent>();
							targetList.add(disp);
							dateStrToDispListMap.put(dispDateAsStr, targetList);
						}
						
					}
				}
			}
		}
		
		// Iterate through the different dates (keys of the map) and add up the following counts
		
		java.util.Set<String> keySet = dateStrToDispListMap.keySet();
		
		for (String dateStr : keySet)
		{
			java.util.List<SubstanceDispensationEvent> targetList = dateStrToDispListMap.get(dateStr);
			// if target list has only one entry
			if (targetList.size() == 1)
			{
				// Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger	
				int countToAdd = 1;
				SubstanceDispensationEvent disp = targetList.get(0);
				INT daysSupply = disp.getDaysSupply();
				if (daysSupply != null)
				{
					if ((daysSupply.getValue()/daysSupplyThreshold) > 1)
					{
						countToAdd = daysSupply.getValue()/daysSupplyThreshold;
					}
				}
				countToReturn += countToAdd;
			}
			else if (targetList.size() >= 2) // if target list has 2+ entries
			{
				// Initialize a HashSet<String> of medicationTypes that have been processed
				java.util.Set<String> medTypesProcessed = new java.util.HashSet<String>();
			
				// Iterate through list of substance dispensation events
				for (SubstanceDispensationEvent disp : targetList)
				{
					AdministrableSubstance sub = disp.getSubstance();
					if (sub != null)
					{
						CD subCode = sub.getSubstanceCode();
						if (subCode != null)
						{
							String codeSystem = subCode.getCodeSystem();
							String code = subCode.getCode();							
							String originalText = subCode.getOriginalText();
							String medType = codeSystem + "^" + code + "^" + originalText;
							
							// if (medType has not been processed)
							if (! medTypesProcessed.contains(medType))
							{
								// Mark medTypeas having been processed
								medTypesProcessed.add(medType);
								
								// iterate through list and sum up the daysSupply for all substanceDispensationEvents with that medType
								int daysSupplyTotal = 0;
								for (SubstanceDispensationEvent disp2 : targetList)
								{
									AdministrableSubstance sub2 = disp2.getSubstance();
									if (sub2 != null)
									{
										CD subCode2 = sub2.getSubstanceCode();
										if (subCode2 != null)
										{
											String codeSystem2 = subCode2.getCodeSystem();
											String code2 = subCode2.getCode();							
											String originalText2 = subCode2.getOriginalText();
											String medType2 = codeSystem2 + "^" + code2 + "^" + originalText2;
											
											if (medType2.equals(medType))
											{
												INT daysSupply2 = disp2.getDaysSupply();
												if (daysSupply2 != null)
												{
													daysSupplyTotal += daysSupply2.getValue();
												}												
											}						
										}
									}
								}
								// Count is 1 or daysSupply/threshold (e.g., 100/33) rounded down to nearest integer (e.g., 3), whichever is larger
								int countToAdd = 1;
								if ((daysSupplyTotal/daysSupplyThreshold) > 1)
								{
									countToAdd = daysSupplyTotal/daysSupplyThreshold;
								}
								countToReturn += countToAdd;
							}						
						}
					}
				}				
			}
		}
		
		// Process inhaler dispensing events:
		// Count number of distinct dates
		if (inhalerSubstanceDispensationEvents != null)
		{
			java.util.Set<String> uniqueSubDispenseDateStrSet = new java.util.HashSet<String>();
			
			for (SubstanceDispensationEvent disp : (java.util.List<SubstanceDispensationEvent>) inhalerSubstanceDispensationEvents)
			{
				IVLDate dispIVLDate = disp.getDispensationTime();
				if (dispIVLDate != null)
				{
					java.util.Date dispDate = ((highLow != null) && (highLow.equals("High"))) ? dispIVLDate.getHigh() : dispIVLDate.getLow(); 
					if (dispDate != null)
					{
						String dispDateAsStr = dateUtility.getDateAsString(dispDate, "yyyy-MM-dd");
						uniqueSubDispenseDateStrSet.add(dispDateAsStr);	
					}
				}
			}
			countToReturn += uniqueSubDispenseDateStrSet.size();
		}
			
		// Process injection dispensing events:
		// Get list size (number of dispensation events)
		if (injectionSubstanceDispensationEvents != null)
		{
			countToReturn += injectionSubstanceDispensationEvents.size();
		}		
		
		return countToReturn;
	}
	
	
	/** dateListsFulfillDistinctDateCountCriteria
	 * @param dateList1
	 * @param dateList2
	 * @param minCount1
	 * @param minCount2
	 * @return true if conditions are met
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static boolean dateListsFulfillDistinctDateCountCriteria(
			java.util.List dateList1, 
			java.util.List dateList2, 
			int minCount1, 
			int minCount2) 
	{
//	/* 
//	Returns true if dateList1 contains at least minCount1 distinct dates and dateList2 contains at least minCount2 distinct dates, where:
//	- Distinct date means not on same day as any other date in dateList1 or dateList2 (ignores hours, minutes and seconds)
//	- A same date in both dateList1 and dateList2 may be counted towards one and only one of the list counts
//
//	E.g., 
//	dateList1 is 1/1/11, 1/2/11, 1/2/11, 1/3/11
//	dateList2 is 1/3/11, 1/4/11, 1/4/11
//
//	dateList1 has 3 distinct dates - 1/1/11, 1/2/11, 1/3/11
//	dateList2 has 2 distinct dates - 1/3/11, 1/4/11
//
//	1/3/11 is shared by both lists but may only be counted towards one.  
//
//	This function first counts up distinct dates in each list that has no overlap with the other.
//
//	dateList1 has 2 distinct dates with no overlap with dateList2 - 1/1/11, 1/2/11
//	dateList2 has 1 distinct date with no overlap with dateList1 - 1/4/11
//
//	Then, for dates that overlap (in this case 1/3/11), it is added to dateList1 if dateList1 has not yet fulfilled its minCount.  If it has, the dates that overlap are added to the dateList2 count.  This approach ensures that the potential for returning true to the function is maximized.
//	*/

		// first, convert null lists to be empty lists
		if (dateList1 == null)
		{
			dateList1 = new java.util.ArrayList();
		}
		
		if (dateList2 == null)
		{
			dateList2 = new java.util.ArrayList();
		}

		// Identify the distinct dates in each list
		
		// these lists contains only dates which have different dates (regardless of hours, minutes and seconds) compared to other dates already included
		java.util.ArrayList<java.util.Date> distinctDateList1 = new java.util.ArrayList<java.util.Date>();
		java.util.ArrayList<java.util.Date> distinctDateList2 = new java.util.ArrayList<java.util.Date>();

		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
		
		for (java.util.Date date1 : (java.util.List<java.util.Date>) dateList1)
		{
			boolean dateAlreadyIncluded1 = false;
			for (java.util.Date distinctDateAlreadyInList1 : distinctDateList1)
			{
				if(dateUtility.isSameDay(date1, distinctDateAlreadyInList1))
				{
					dateAlreadyIncluded1 = true;
				}
			}
			if (! dateAlreadyIncluded1)
			{
				// add version with no time components
				distinctDateList1.add(stripTimeComponent(date1));
			}
		}
		
		for (java.util.Date date2 : (java.util.List<java.util.Date>) dateList2)
		{
			boolean dateAlreadyIncluded2 = false;
			for (java.util.Date distinctDateAlreadyInList2 : distinctDateList2)
			{
				if(dateUtility.isSameDay(date2, distinctDateAlreadyInList2))
				{
					dateAlreadyIncluded2 = true;
				}
			}
			if (! dateAlreadyIncluded2)
			{
				// add version with no time components
				distinctDateList2.add(stripTimeComponent(date2));
			}
		}
		
		// Identify dates that overlap in the two lists and add them to the common list
		
		java.util.ArrayList<java.util.Date> distinctDateListOverlap = new java.util.ArrayList<java.util.Date>();
		
		for (int i = 0; i < distinctDateList1.size(); i++)
		{
			java.util.Date distinctDate1 = distinctDateList1.get(i);
			
			for (int j = 0; j < distinctDateList2.size(); j++)
			{
				
				java.util.Date distinctDate2 = distinctDateList2.get(j);
				
				if(dateUtility.isSameDay(distinctDate1, distinctDate2))
				{				
					distinctDateListOverlap.add(distinctDate1);
				}
			}
		}
		
		// Create new lists that do not contain the overlapping dates	
		java.util.ArrayList<java.util.Date> distinctDateList1NoOverlap = new java.util.ArrayList<java.util.Date>();
		java.util.ArrayList<java.util.Date> distinctDateList2NoOverlap = new java.util.ArrayList<java.util.Date>();
		
		for (java.util.Date date1 : distinctDateList1)
		{
			if (! distinctDateListOverlap.contains(date1))
			{
				distinctDateList1NoOverlap.add(date1);
			}
		}
		
		for (java.util.Date date2 : distinctDateList2)
		{
			if (! distinctDateListOverlap.contains(date2))
			{
				distinctDateList2NoOverlap.add(date2);
			}
		}
		
		int list1Count = distinctDateList1NoOverlap.size();
		int list2Count = distinctDateList2NoOverlap.size();
		int overlapCount = distinctDateListOverlap.size();
		
		for (int k = 0; k < overlapCount; k++)
		{
			if (list1Count < minCount1)
			{
				list1Count++;
			}
			else
			{
				list2Count++;
			}
		}
		
		if((list1Count >= minCount1) && (list2Count >= minCount2))
		{
			return true;
		}
		else
		{
			return false;
		}
	}	
	
	
	/** encAfterEncFromListWithinTime
	 * @param enc
	 * @param encList
	 * @param highLow1
	 * @param highLow2
	 * @param time
	 * @param timeUnits
	 * @param namedObjects
	 * @return true if conditions are met
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encAfterEncFromListWithinTime	(
			EncounterEvent enc,
			java.util.List		encList, 
			java.lang.String 	highLow1, 
			java.lang.String 	highLow2, 
			int 				time, 
			int 				timeUnits, 
			java.util.HashMap 	namedObjects
			) 

//	/*
//	Returns true if enc was at most time timeUnits after another encounter from encList.
//	Pre-conditions: 
//		encList must not be null, but may be empty.  If populated, it must contain list elements of type EncounterEvent.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of encounterEventTime for encounters from the list to be used.
//		time must be a primitive integer representing the adjustment to the encounterEventTime which defines the range in which the problem time must occur
//		timeUnits must be a primitive integer representing the java.util.Calendar enumeration of time units for the above adjustment
//		namedObjects must not be null, but may be empty
//	*/
	{

			boolean encFlag = false;

			for (Object oEnc : encList) 
			{
				EncounterEvent encFromList = (EncounterEvent) oEnc;	
				
				if (("Low".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(encFromList.getEncounterEventTime().getLow(), enc.getEncounterEventTime().getLow() , time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(encFromList.getEncounterEventTime().getHigh(), enc.getEncounterEventTime().getHigh() , time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(encFromList.getEncounterEventTime().getLow(), enc.getEncounterEventTime().getHigh() , time, timeUnits, namedObjects));		
				} else if (("Low".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(encFromList.getEncounterEventTime().getHigh(), enc.getEncounterEventTime().getLow() , time, timeUnits, namedObjects));		
				} 
				if (encFlag == true)
				{
					return true;
				}
			}

		return false;
	}
	
	
	/** encAfterMedSubDispenseDaysSupplyActiveFromListWithinTime
	 * @param enc
	 * @param subDispenseList
	 * @param highLow1
	 * @param time
	 * @param timeUnits
	 * @param namedObjects
	 * @return true if conditions met
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encAfterMedSubDispenseDaysSupplyActiveFromListWithinTime	(
			EncounterEvent enc,
			java.util.List		subDispenseList,  
			java.lang.String 	highLow1, 
			int 				time, 
			int 				timeUnits, 
			java.util.HashMap 	namedObjects
			) 

//	/* 
//	Returns true if enc was at most time timeUnits and at least 1 day after Substance Dispensation event low time plus daysSupply.
//	Pre-conditions: 
//		subDispenseList must not be null, but may be empty.  If populated, it must contain list elements of type SubDispenseEvent.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of encounterEventTime for encounters from the list to be used.
//		time must be a primitive integer representing the adjustment to the encounterEventTime which defines the range in which the problem time must occur
//		timeUnits must be a primitive integer representing the java.util.Calendar enumeration of time units for the above adjustment
//		namedObjects must not be null, but may be empty
//	*/
	{

			boolean encFlag = false;

			for (Object oSubDispenseEvent : subDispenseList) 
			{
				SubstanceDispensationEvent sub = (SubstanceDispensationEvent) oSubDispenseEvent;
				if ("Low".equals(highLow1) )	
				{	
					encFlag = (
					
					timeIntervalsOverlapIgnoringTimeComponents(
						getTimeInterval(
							sub.getDispensationTime().getLow(), 
							org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(sub.getDispensationTime().getLow(), java.util.Calendar.DATE, sub.getDaysSupply().getValue() - 1)
										), 
						getTimeInterval	(
							org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(enc.getEncounterEventTime().getLow(), timeUnits, -1*time -1),
							org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(enc.getEncounterEventTime().getLow(), 5, -1)  
										)
					
					)
					);	

				} else if ("High".equals(highLow1) )	
				{	
					encFlag = (
					
					timeIntervalsOverlapIgnoringTimeComponents(
						getTimeInterval(
							sub.getDispensationTime().getLow(), 
							org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(sub.getDispensationTime().getLow(), 5, sub.getDaysSupply().getValue() - 1)
										), 
						getTimeInterval	(
							org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(enc.getEncounterEventTime().getHigh(), timeUnits, -1*time -1),
							org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(enc.getEncounterEventTime().getHigh(), 5, -1)  
										)
					
					)
					);
				}
				if (encFlag == true)
				{
					return true;
				}
			}

		return false;
	}
	
	
	/** encAfterMedSubDispenseFromListWithinTime
	 * @param enc
	 * @param subDispenseList
	 * @param highLow1
	 * @param highLow2
	 * @param time
	 * @param timeUnits
	 * @param namedObjects
	 * @return true if condition met
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encAfterMedSubDispenseFromListWithinTime	(
			EncounterEvent 		enc,
			java.util.List		subDispenseList,  
			java.lang.String 	highLow1, 
			java.lang.String 	highLow2, 
			int 				time, 
			int 				timeUnits, 
			java.util.HashMap 	namedObjects
			) 

//	/* 
//	Returns true if enc was at most time timeUnits and at least 1 day after Substance Dispensation event low time.
//	Pre-conditions: 
//		encList must not be null, but may be empty.  If populated, it must contain list elements of type EncounterEvent.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of encounterEventTime for encounters from the list to be used.
//		time must be a primitive integer representing the adjustment to the encounterEventTime which defines the range in which the problem time must occur
//		timeUnits must be a primitive integer representing the java.util.Calendar enumeration of time units for the above adjustment
//		namedObjects must not be null, but may be empty
//		'5' is a code for 'days'
//	*/
	{

			boolean encFlag = false;

			for (Object oSubDispenseEvent : subDispenseList) 
			{
				SubstanceDispensationEvent sub = (SubstanceDispensationEvent) oSubDispenseEvent;
				
				if (("Low".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(sub.getDispensationTime().getLow(), enc.getEncounterEventTime().getLow(), time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(sub.getDispensationTime().getHigh(), enc.getEncounterEventTime().getHigh(), time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(sub.getDispensationTime().getLow(), enc.getEncounterEventTime().getHigh(), time, timeUnits, namedObjects));		
				} else if (("Low".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(sub.getDispensationTime().getHigh(), enc.getEncounterEventTime().getLow(), time, timeUnits, namedObjects));		
				}
				if (encFlag == true)
				{
					return true;
				}
			}

		return false;
	}
	
	
	/** encAfterProbFromListWithinTime
	 * @param enc
	 * @param probList
	 * @param highLow1
	 * @param highLow2
	 * @param time
	 * @param timeUnits
	 * @param namedObjects
	 * @return true if condition met
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encAfterProbFromListWithinTime	(
			EncounterEvent enc,
			java.util.List		probList, 
			java.lang.String 	highLow1, 
			java.lang.String 	highLow2, 
			int 				time, 
			int 				timeUnits, 
			java.util.HashMap 	namedObjects
			) 

//	/* 
//	Returns true if enc was at most time timeUnits after Encounter Dx from probList
//	Pre-conditions: 
//		probList must not be null, but may be empty.  If populated, it must contain list elements of type Problem.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of problemEffectiveTime to be used.
//		time must be a primitive integer representing the adjustment to the encounterEventTime which defines the range in which the problem time must occur
//		timeUnits must be a primitive integer representing the java.util.Calendar enumeration of time units for the above adjustment
//		namedObjects must not be null, but may be empty
//	*/
	{

			boolean encFlag = false;

			for (Object oProb : probList) 
			{
				Problem prob = (Problem) oProb;	
				
				if (("Low".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(prob.getProblemEffectiveTime().getLow(), enc.getEncounterEventTime().getLow() , time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(prob.getProblemEffectiveTime().getHigh(), enc.getEncounterEventTime().getHigh() , time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(prob.getProblemEffectiveTime().getLow(), enc.getEncounterEventTime().getHigh() , time, timeUnits, namedObjects));		
				} else if (("Low".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(prob.getProblemEffectiveTime().getHigh(), enc.getEncounterEventTime().getLow() , time, timeUnits, namedObjects));		
				} 
							if (encFlag == true)
				{
					return true;
				}
			}

		return false;
			
	}
	
	
	/** encBeforeEncFromListWithinTime
	 * @param enc
	 * @param encList
	 * @param highLow1
	 * @param highLow2
	 * @param time
	 * @param timeUnits
	 * @param namedObjects
	 * @return true if condition met
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encBeforeEncFromListWithinTime	(
			EncounterEvent enc,
			java.util.List		encList, 
			java.lang.String 	highLow1, 
			java.lang.String 	highLow2, 
			int 				time, 
			int 				timeUnits, 
			java.util.HashMap 	namedObjects
			) 

//	/* 
//	Returns true if enc was at most time timeUnits before any encounter from encList
//	Pre-conditions: 
//		encList must not be null, but may be empty.  If populated, it must contain list elements of type EncounterEvent.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of encounterEventTime for encounters from the list to be used.
//		time must be a primitive integer representing the adjustment to the encounterEventTime which defines the range in which the problem time must occur
//		timeUnits must be a primitive integer representing the java.util.Calendar enumeration of time units for the above adjustment
//		namedObjects must not be null, but may be empty
//	*/
	{

			boolean encFlag = false;

			for (Object oEnc : encList) 
			{
				EncounterEvent encFromList = (EncounterEvent) oEnc;	
				
				if (("Low".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(enc.getEncounterEventTime().getLow(),  encFromList.getEncounterEventTime().getLow(), time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(enc.getEncounterEventTime().getHigh(), encFromList.getEncounterEventTime().getHigh(), time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(enc.getEncounterEventTime().getHigh(), encFromList.getEncounterEventTime().getLow(), time, timeUnits, namedObjects));		
				} else if (("Low".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(enc.getEncounterEventTime().getLow(),  encFromList.getEncounterEventTime().getHigh(), time, timeUnits, namedObjects));		
				} 
				if (encFlag == true)
				{
					return true;
				}
			}

		return false;
	}
	
	
	/** encBeforeMedSubDispenseFromListWithinTime
	 * @param enc
	 * @param subDispenseList
	 * @param highLow1
	 * @param highLow2
	 * @param time
	 * @param timeUnits
	 * @param namedObjects
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encBeforeMedSubDispenseFromListWithinTime	(
			EncounterEvent enc,
			java.util.List		subDispenseList,  
			java.lang.String 	highLow1, 
			java.lang.String 	highLow2, 
			int 				time, 
			int 				timeUnits, 
			java.util.HashMap 	namedObjects
			) 

//	/* 
//	Returns true if enc was at most time timeUnits and at least 1 day before Substance Dispensation event low time.
//	Pre-conditions: 
//		encList must not be null, but may be empty.  If populated, it must contain list elements of type EncounterEvent.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of encounterEventTime for encounters from the list to be used.
//		time must be a primitive integer representing the adjustment to the encounterEventTime which defines the range in which the problem time must occur
//		timeUnits must be a primitive integer representing the java.util.Calendar enumeration of time units for the above adjustment
//		namedObjects must not be null, but may be empty
//		'5' is a code for 'days'
//	*/
	{

			boolean encFlag = false;

			for (Object oSubDispenseEvent : subDispenseList) 
			{
				SubstanceDispensationEvent sub = (SubstanceDispensationEvent) oSubDispenseEvent;
				
				if (("Low".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(stripTimeComponent(enc.getEncounterEventTime().getLow()), stripTimeComponent(sub.getDispensationTime().getLow()), time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(stripTimeComponent(enc.getEncounterEventTime().getHigh()), stripTimeComponent(sub.getDispensationTime().getHigh()), time, timeUnits, namedObjects));		
				} else if (("High".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(stripTimeComponent(enc.getEncounterEventTime().getHigh()), stripTimeComponent(sub.getDispensationTime().getLow()), time, timeUnits, namedObjects));		
				} else if (("Low".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (timeBeforeByAtMost(stripTimeComponent(enc.getEncounterEventTime().getLow()), stripTimeComponent(sub.getDispensationTime().getHigh()), time, timeUnits, namedObjects));		
				}
				if (encFlag == true)
				{
					return true;
				}
			}

		return false;
	}
	
	
	/** encInEncList
	 * @param enc
	 * @param encList
	 * @param namedObjects
	 * @return true if encList containst enc
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encInEncList	(
			EncounterEvent 		enc,
			java.util.List		encList,  
			java.util.HashMap 	namedObjects
			) 

//	/* 
//	Returns true if enc is in EncList
//	Pre-conditions: encList must not be null, but may be empty.  If populated, it must contain list elements of type EncounterEvent
//	*/
	{

		for (Object oEnc : encList) 
			{
				EncounterEvent encFromList = (EncounterEvent) oEnc;	
				if (enc.getId().equals(encFromList.getId()))
				{
					return true;
				}
			}

		return false;
	}
	
	
	/** encMeetsCsrCountReq
	 * @param enc
	 * @param csrList
	 * @param minCount
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static boolean encMeetsCsrCountReq	(
			EncounterEvent 		enc,
			java.util.List		csrList,  
			int 				minCount
			) 

//	/* 
//	 	Returns true if enc has minCount or more matching entries in encProbCsrList
//	 	
//	Pre-conditions: 
//		If populated, csrList must contain list elements of type ClinicalStatementRelationship.
//	
//	Input variables:
//		enc
//		csrList
//		minCount - minimum count of matching CSRs required
//	*/
	{
		int csrCount = 0;
		if (csrList != null)
		{
			for (ClinicalStatementRelationship csr : (List<ClinicalStatementRelationship>) csrList) 
			{
				if (csr.getSourceId().equals(enc.getId()))	
				{	
					csrCount++;
	
				} 
				if (csrCount > minCount)
				{
					return true;
				}
			}
		}

		return false;
	}
	
	
	/** encSameDayMedSubDispenseFromList
	 * @param enc
	 * @param subDispenseList
	 * @param highLow1
	 * @param highLow2
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static boolean encSameDayMedSubDispenseFromList(
			EncounterEvent enc,
			java.util.List		subDispenseList,  
			java.lang.String 	highLow1, 
			java.lang.String 	highLow2
			) 

//	/* 
//	Returns true if enc was on the same day as Substance Dispensation event.
//	Pre-conditions: 
//		encList must not be null, but may be empty.  If populated, it must contain list elements of type EncounterEvent.
//		highLow1 and highLow2 must not be null, must be either "High" or "Low".
//		highLow1 represents the time component of encounterEventTime to be used.
//		highLow2 represents the time component of encounterEventTime for encounters from the list to be used.
//	*/
	{

			boolean encFlag = false;

			for (Object oSubDispenseEvent : subDispenseList) 
			{
				SubstanceDispensationEvent sub = (SubstanceDispensationEvent) oSubDispenseEvent;
				
				if (("Low".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (org.opencds.common.utilities.DateUtility.getInstance().isSameDay(stripTimeComponent(enc.getEncounterEventTime().getLow()), stripTimeComponent(sub.getDispensationTime().getLow())));		
				} else if (("High".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (org.opencds.common.utilities.DateUtility.getInstance().isSameDay(stripTimeComponent(enc.getEncounterEventTime().getHigh()), stripTimeComponent(sub.getDispensationTime().getHigh())));		
				} else if (("High".equals(highLow1) ) && ("Low".equals(highLow2) ))	
				{	
					encFlag = (org.opencds.common.utilities.DateUtility.getInstance().isSameDay(stripTimeComponent(enc.getEncounterEventTime().getHigh()), stripTimeComponent(sub.getDispensationTime().getLow())));		
				} else if (("Low".equals(highLow1) ) && ("High".equals(highLow2) ))	
				{	
					encFlag = (org.opencds.common.utilities.DateUtility.getInstance().isSameDay(stripTimeComponent(enc.getEncounterEventTime().getLow()), stripTimeComponent(sub.getDispensationTime().getHigh())));		
				}
				if (encFlag == true)
				{
					return true;
				}
			}

		return false;
	}
	
	
    /** getAgeInTimeUnitAtTime
     * @param birthDate
     * @param specifiedTime
     * @param calendarTimeUnit
     * @return
     */
	public static long getAgeInTimeUnitAtTime(java.util.Date birthDate, java.util.Date specifiedTime, int calendarTimeUnit)
    {
//   	  /*
//         * Returns a person's age using the calendarUnits specified.  If unable to compute, returns -1.
//    	   *
//         * Time components are ignored if calendarTimeUnit is in years, months, or days.
//         * 
//         * @param calendarTimeUnit - must be in java Calendar units.  Weeks are not supported.
//         * 
//         */
    	if ((birthDate == null) || (specifiedTime == null))
        {
            return -1;
        }
    	
    	org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();

	// this function ignores time components if time units are days or above
    	org.opencds.common.utilities.AbsoluteTimeDifference atd = dateUtility.getAbsoluteTimeDifference(birthDate, specifiedTime, calendarTimeUnit);
    	
    	if (calendarTimeUnit == java.util.Calendar.YEAR)
    	{
    		return atd.getYearDifference();
    	}
    	else if (calendarTimeUnit == java.util.Calendar.MONTH)
    	{
    		return atd.getMonthDifference();
    	}
    	else if ((calendarTimeUnit == java.util.Calendar.DATE) ||
    			(calendarTimeUnit == java.util.Calendar.DAY_OF_MONTH) ||
    			(calendarTimeUnit == java.util.Calendar.DAY_OF_WEEK) ||
    			(calendarTimeUnit == java.util.Calendar.DAY_OF_WEEK_IN_MONTH) ||
    			(calendarTimeUnit == java.util.Calendar.DAY_OF_YEAR))
    	{
    		return atd.getDayDifference();
    	}
    	else if ((calendarTimeUnit == java.util.Calendar.HOUR_OF_DAY) ||
	                (calendarTimeUnit == java.util.Calendar.HOUR))
        {
    		return atd.getHourDifference();
        }
    	else if (calendarTimeUnit == java.util.Calendar.MINUTE)
    	{
    		return atd.getMinuteDifference();
    	}
    	else if (calendarTimeUnit == java.util.Calendar.SECOND)
    	{
    		return atd.getSecondDifference();
    	}
    	else if (calendarTimeUnit == java.util.Calendar.MILLISECOND)
    	{
    		return atd.getMillisecondDifference();
    	}
    	else
    	{
    		return -1;
    	}
    }
	
	
    /** getAssertionsAsString
     * @param assertions
     * @return
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static String getAssertionsAsString(java.util.HashSet assertions) 
    {
    	java.util.ArrayList<String> assertionsList = new java.util.ArrayList<String>(assertions);
    	java.util.Collections.sort(assertionsList);
    	java.lang.StringBuffer buffer = new java.lang.StringBuffer();
    	
    	for (int k = 0; k < assertionsList.size(); k++)
    	{
    		String assertion = assertionsList.get(k);
    		buffer.append(assertion);
//    		if (assertion.startsWith("C0") || assertion.startsWith("C1") || assertion.startsWith("C2") || assertion.startsWith("C3") || assertion.startsWith("C4") || assertion.startsWith("C5") || assertion.startsWith("C6") || assertion.startsWith("C7") || assertion.startsWith("C8") || assertion.startsWith("C9"))
//    		{
//    			buffer.append("=");
//    			buffer.append(getOpenCDSConceptName(assertion));
//    		}
    			
    		if (k <	assertionsList.size() - 1)
    		{
    			buffer.append("|");
    		}
    	}

    	return buffer.toString();
    }
    
    
    /** getConceptDetailAsString
     * @param conceptDetails
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static String getConceptDetailAsString(java.util.Set conceptDetails) 
    {
//    	Take in a Set containing Concepts and returns a string including both the ID and the description of the concept

    	java.util.HashSet<String> conceptCodesPlusId = new java.util.HashSet<String>();

    	for (Object conceptDetail : conceptDetails)
    	{
    		String conceptCode = ((VmrOpenCdsConcept) conceptDetail).getOpenCdsConceptCode();
    		String conceptTargetId = ((VmrOpenCdsConcept) conceptDetail).getConceptTargetId();
    		String codePlusId = conceptCode + "(id:" + conceptTargetId + ")";

    		conceptCodesPlusId.add(codePlusId );
    	}

    	java.util.ArrayList<String> conceptCodesPlusIdAsList = new java.util.ArrayList<String>(conceptCodesPlusId);
    	java.util.Collections.sort(conceptCodesPlusIdAsList);
    	java.lang.StringBuffer buffer = new java.lang.StringBuffer();
    	
    	for (int k = 0; k < conceptCodesPlusIdAsList.size(); k++)
    	{
    		String codePlusId = conceptCodesPlusIdAsList.get(k);
    		String conceptCode = codePlusId.substring(0, codePlusId.indexOf("(") );
    		String conceptTargetId = codePlusId.substring(codePlusId.indexOf("("), codePlusId.length() );
    		buffer.append(conceptCode);
//    		buffer.append("=");
//    		buffer.append(GetOpenCDSConceptName.getOpenCDSConceptName(conceptCode));
    		buffer.append(" " + conceptTargetId);
    			
    		if (k <	conceptCodesPlusIdAsList.size() - 1)
    		{
    			buffer.append("|");
    		}
    	}

    	return buffer.toString();
    }
    
    
    /** getConceptsAsString
     * @param concepts
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static String getConceptsAsString(java.util.Set concepts) 
    {
    	 // Take in a Set containing Concepts and returns a string

    	java.util.HashSet<String> conceptCodes = new java.util.HashSet<String>();

    	for (Object concept : concepts)
    	{
    		String conceptCode = ((VmrOpenCdsConcept) concept).getOpenCdsConceptCode();
    		conceptCodes.add(conceptCode);
    	}

    	java.util.ArrayList<String> conceptCodesAsList = new java.util.ArrayList<String>(conceptCodes);
    	java.util.Collections.sort(conceptCodesAsList);
    	java.lang.StringBuffer buffer = new java.lang.StringBuffer();
    	//GetOpenCDSConceptName getName = GetOpenCDSConceptName.
    	
    	for (int k = 0; k < conceptCodesAsList.size(); k++)
    	{
    		String conceptCode = conceptCodesAsList.get(k);
    		buffer.append(conceptCode);
//    		buffer.append("=");
//    		buffer.append(GetOpenCDSConceptName.getOpenCDSConceptName(conceptCode));
    			
    		if (k <	conceptCodesAsList.size() - 1)
    		{
    			buffer.append("|");
    		}
    	}

    	return buffer.toString();
    }
    
    
    /** getCountFromMapObjectInNamedObject
     * @param namedObjectKeyForMap
     * @param namedObjects
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static int getCountFromMapObjectInNamedObject(String namedObjectKeyForMap, Map namedObjects) 
    {
//	/*
//	 * Inputs:  namedObjectKeyForMap: the key to namedObjects which contains the Map.  
//	 * namedObjects: global namedObjects.  Must not be null.   
//	 * 
//	 * Returns:  count of distinct entries in Map
//	 */
    	java.util.Map namedMap = (java.util.Map) namedObjects.get(namedObjectKeyForMap);
    	if (namedMap == null)
    	{
    		return 0;
    	}
    	else
    	{
    		return namedMap.size();
    	}
    }
    
    
//    /** getDateStringFromIVLDate has been replaced by getFormattedDateStringFromIVLDate
//     * 
//	 * @param thisIvl
//	 * @param highLowBoth
//	 * @param prependClassLabel
//	 * @param classLabel
//	 * @param lowLabel
//	 * @param highLabel
//	 * @param bothSeparator
//	 * @param nullLabel
//	 * @return String representing an HL7 IVL_Date containing a time interval defined by a low date and a high date
//	 */
//    public static String getDateStringFromIVLDate(IVLDate thisIvl, String highLowBoth, boolean prependClassLabel, String classLabel, String lowLabel, String highLabel, String bothSeparator, String nullLabel) {
////	/*
////	accepts IVLDate, and build a date string from either the high or the low date, or both, depending on the value of highLowBoth.
////	substitutes the submitted param "nullLabel" for the date value when the date value is null.
////	identifies whether the value is the low or high component of the interval using the submitted params for lowLabel and highLabel.
////	separates the two date values with the submitted param for bothLabel when both dates are requested.
////	returns an empty string if the entire submitted IVLDate is null.
////	
////	Examples using prependClassLabel = true, classLabel = "proc-", lowLabel = "low:", highLabel = "high:", bothSeparator = "-", nullLabel = "null" 
////		"proc-low:01/29/2014"  
////		"proc-high:02/04/2014"
////		"proc-low:01/29/2014-high:02/04/2014"
////		"proc-low:null"
////		"proc-high:null"
////		"proc-low:null-high:02/04/2014"
////		"proc-low:01/29/2014-high:null"
////		"proc-low:null-high:null"
////	
////	*/
//		if (thisIvl == null) return "";
//		String classLabelFinal = (prependClassLabel) ? classLabel : "";
//		
//		String lowDate = "";
//		if (thisIvl.getLow() == null) {
//			lowDate = lowLabel + nullLabel;
//		} else {
//			lowDate = lowLabel + thisIvl.getLow().toString();
//		}
//		
//		String highDate = "";
//		if (thisIvl.getHigh() == null) {
//			highDate = highLabel + nullLabel;
//		} else {
//			highDate = highLabel + thisIvl.getHigh().toString();
//		}
//		
//		if ("Low".equals(highLowBoth)) {
//			return classLabelFinal + lowDate;
//		} else if ("High".equals(highLowBoth)) {
//			return classLabelFinal + highDate;
//		} else if ("Both".equals(highLowBoth)) {
//			return classLabelFinal + lowDate + bothSeparator + highDate;
//		} else 
//			return "";
//	}
	
	
	/** getDistinctDatesFromEncList
	 * @param encList
	 * @param highLow
	 * @return List of distinct dates in encList
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getDistinctDatesFromEncList(java.util.List encList, String highLow) 
	{
//		/* 
//		Returns List of distinct dates in encList.  Uses specified high or low time (must be "High" or "Low").  Ignores hours, minutes, and seconds.  
//
//		Returns empty list if no matching entries.
//		*/
			java.util.ArrayList<java.util.Date> listToReturn = new java.util.ArrayList<java.util.Date>();

			if (encList == null)
			{
				return listToReturn;
			}

			org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
			
			for (EncounterEvent enc : (List<EncounterEvent>) encList)
			{
				boolean dateAlreadyIncluded = false;
				
				IVLDate ivlDate = enc.getEncounterEventTime();
				if (ivlDate != null)
				{
					
					java.util.Date date = null;
					if ((highLow != null) && (highLow.equals("High")))
					{
						date = ivlDate.getHigh();
					}
					else if ((highLow != null) && (highLow.equals("Low")))
					{
						date = ivlDate.getLow();
					}
					else
					{
						System.err.println(">>> Error in GetDistinctDatesFromEncList: highLow value of " + highLow + " not recognized.  Using Low time.");
						date = ivlDate.getLow();
					}
					
					for (java.util.Date distinctDateAlreadyInList : listToReturn)
					{
						if(dateUtility.isSameDay(date, distinctDateAlreadyInList))
						{
							dateAlreadyIncluded = true;
						}
					}
					if (! dateAlreadyIncluded)
					{
						listToReturn.add(date);
					}
				
				}			
			}		
			return listToReturn;
	}
	
	
	/** getEarliestDateFromEncounterList
	 * @param encounterEventList
	 * @param highLow
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.Date getEarliestDateFromEncounterList(List encounterEventList, String highLow) 
	{
//	/*
//		Returns earliest date in encounter event list.
//		Returns null if list is null or empty.
//		highLow must be "High" or "Low" and designates whether to use encounterEventTime low or high times.
//		If a date is null for an encounter, it is ignored for the purposes of this function.
//	*/
		if ((encounterEventList == null) || (encounterEventList.size() == 0))
		{
			return null;
		}

		java.util.ArrayList<java.util.Date> encounterDates = new java.util.ArrayList<java.util.Date>();

		for (EncounterEvent enc : (List<EncounterEvent>) encounterEventList)
		{
			IVLDate encEventTime = enc.getEncounterEventTime();
			if (encEventTime != null)
			{
				java.util.Date encDate = null;
				if (highLow.equalsIgnoreCase("Low"))
				{
					encDate = encEventTime.getLow();
					
				}
				else if (highLow.equalsIgnoreCase("High"))
				{
					encDate = encEventTime.getHigh();				
				}
				else
				{
					System.err.println(">> Error in GetEarliestDateFromEncounterList: highLow value of " + highLow + " not recognized.  Processing as Low.");
					encDate = encEventTime.getLow();
				}

				if (encDate != null)
				{
					encounterDates.add(encDate);
				}
			}
		}

		java.util.Collections.sort(encounterDates); // ascending order

		if (encounterDates.size() == 0)
		{
			return null;
		}
		else
		{
			return encounterDates.get(0);
		}
	}
	
	
	/** getEarliestDateFromSubDispenseEventList
	 * @param SubstanceDispensationEventList
	 * @param highLow
	 * @return earliest low or high date from List
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.Date getEarliestDateFromSubDispenseEventList (List SubstanceDispensationEventList, String highLow) 
	{
//	/*
//		Returns earliest date in substanceDispensation event list.
//		Returns null if list is null or empty.
//		highLow must be "High" or "Low" and designates whether to use SubstanceDispensationEventTime low or high times.
//		If a date is null for an substanceDispensation, it is ignored for the purposes of this function.
//	*/
		if ((SubstanceDispensationEventList == null) || (SubstanceDispensationEventList.size() == 0))
		{
			return null;
		}

		java.util.ArrayList<java.util.Date> substanceDispensationDates = new java.util.ArrayList<java.util.Date>();

		for (SubstanceDispensationEvent subDisp : (List<SubstanceDispensationEvent>) SubstanceDispensationEventList)
		{
			IVLDate subDispEventTime = subDisp.getDispensationTime();
			if (subDispEventTime != null)
			{
				java.util.Date subDispDate = null;
				if (highLow.equalsIgnoreCase("Low"))
				{
					subDispDate = subDispEventTime.getLow();
					
				}
				else if (highLow.equalsIgnoreCase("High"))
				{
					subDispDate = subDispEventTime.getHigh();				
				}
				else
				{
					System.err.println(">> Error in getEarliestDateFromSubDispenseEventList: highLow value of " + highLow + " not recognized.  Processing as Low.");
					subDispDate = subDispEventTime.getLow();
				}

				if (subDispDate != null)
				{
					substanceDispensationDates.add(subDispDate);
				}
			}
		}

		java.util.Collections.sort(substanceDispensationDates); // ascending order

		if (substanceDispensationDates.size() == 0)
		{
			return null;
		}
		else
		{
			return substanceDispensationDates.get(0);
		}
	}
	
	
	/** getEarliestEncounterFromEncounterList
	 * @param encounterEventList
	 * @param highLow
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static EncounterEvent getEarliestEncounterFromEncounterList(List encounterEventList, String highLow) 
	{
//	/*
//		Returns earliest encounter in encounter event list.
//		Returns null if list is null or empty.
//		highLow must be "High" or "Low" and designates whether to use encounterEventTime low or high times.
//		If a date is null for an encounter, it is ignored for the purposes of this function.
//		If there are two or more encounters with the same date/time, the ID of the first encounter in the list with that date/time will be returned.
//	*/
		if ((encounterEventList == null) || (encounterEventList.size() == 0))
		{
			return null;
		}
		
		String idOfEarliestEncounter = getIdOfEarliestEncounterFromEncounterList(encounterEventList, highLow);
		
		if (idOfEarliestEncounter != null)
		{
			for (EncounterEvent enc : (List<EncounterEvent>) encounterEventList)
			{
				String encId = enc.getId();
				if ((encId != null) && (encId.equals(idOfEarliestEncounter)))
				{
					return enc;
				}
			}
		}

		return null;
	}
	
	
	/** getEncounterConceptListToInsert
	 * @param procedureConcepts
	 * @param clinicalStatementRelationships
	 * @param encounterConcepts
	 * @return List of new EncounterConcepts derived from ProcedureConcepts
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static java.util.List getEncounterConceptListToInsert(List procedureConcepts, List clinicalStatementRelationships, List encounterConcepts) 
{
///*
//	Returns list of encounterTypeConcepts.
//	Returns an empty list if either procedureConcepts or clinicalStatementRelationships is null or empty.
//*/
	
    String beginDate = DateUtility.getInstance().getDateAsString(new java.util.Date(), "yyyyMMddHHmmss.SSSZZZZZ");
		
	Set<String> etcSet = new HashSet<String>();
	Set<String> pcSet = new HashSet<String>();
	java.util.List<EncounterTypeConcept> listToReturn = new java.util.ArrayList<EncounterTypeConcept>();
	
	if ((procedureConcepts == null) || (procedureConcepts.size() == 0))
	{
		//System.out.println(beginDate + " procedureConcepts=null or empty" );
		return listToReturn;
	}
	
	if ((clinicalStatementRelationships == null) || (clinicalStatementRelationships.size() == 0))
	{
		System.out.println(beginDate + " clinicalStatementRelationships=null or empty" );
		return listToReturn;
	}
	
	if (encounterConcepts == null)
	{
		System.out.println(beginDate + " encounterConcepts=null" );
		return listToReturn;
	} else {
		System.out.println(beginDate + " encounterConcepts=" + encounterConcepts.size());
	}
	
				
//	System.out.println(beginDate + " procedureConcepts=" + procedureConcepts.size());
//	System.out.println(beginDate + " clinicalStatementRelationships=" + clinicalStatementRelationships.size());
	
	for (ProcedureConcept pc : (List<ProcedureConcept>) procedureConcepts)
	{
		String pcHash = pc.getOpenCdsConceptCode() + "|" + pc.getConceptTargetId();
		pcSet.add(pcHash);
	}
	
	if (encounterConcepts != null)
	{
		for (EncounterTypeConcept etc : (List<EncounterTypeConcept>) encounterConcepts) 
		{
			String etcHash = etc.getOpenCdsConceptCode() + "|" + etc.getConceptTargetId();
			etcSet.add(etcHash);
		}
	}
	
	
	for (ProcedureConcept pc : (List<ProcedureConcept>) procedureConcepts)
	{
		String pcConceptCode = pc.getOpenCdsConceptCode();
		String pcId = pc.getConceptTargetId();
		String pcDTMC = pc.getDeterminationMethodCode();
		String pcDN = pc.getDisplayName();
		String pcConceptId = pc.getId();
		
		//find all the CSRs with pcId as targetId
		for (ClinicalStatementRelationship csr : (List<ClinicalStatementRelationship>)clinicalStatementRelationships)
		{
			if (pcId.equals(csr.getTargetId()))
			{
				//found the targetId, so use the sourceId to check for an entry in the etc list
				String sourceId = csr.getSourceId();
				String hashkey = pcConceptCode + "|" + sourceId;
				if ( ! etcSet.contains(hashkey))
				{
					//did not find it, so add the concept to listToReturn
					EncounterTypeConcept newEtc = new EncounterTypeConcept();
					newEtc.setConceptTargetId(pcId);
					newEtc.setOpenCdsConceptCode(pcConceptCode);
					newEtc.setDeterminationMethodCode(pcDTMC);
					newEtc.setDisplayName(pcDN);
					newEtc.setId(pcConceptId + "^generated"); 
					listToReturn.add(newEtc);
					
					//now add it to hashset, so we don't try to create it again...
					etcSet.add(hashkey);
				}
			}
		}
	}
	
//	System.out.println(DateUtility.getInstance().getDateAsString(new java.util.Date(), "yyyyMMddHHmmss.SSSZZZZZ") + " newEncTypeConcepts=" + listToReturn.size());
	return listToReturn;		
}

	
	/** getEarliestOrLatestDateFromListOfClinicalStatements
	 * @param clinicalStatementList
	 * @param highLow
	 * @param earliestLatest
	 * @return
	 */
	public static java.util.Date getEarliestOrLatestDateFromListOfClinicalStatements(List<ClinicalStatement> clinicalStatementList, String highLow, String earliestLatest) 
	{
	/*
		Returns earliest or latest date in clinical statement list.
		Returns null if list is null or empty.
		highLow must be "High" or "Low" and designates whether to use procedureTime low or high times.
		earliestLatest must be "<" for earliest or ">" for latest 
		If a date is null for a clinicalStatement, it is ignored for the purposes of this function.
	*/
		if ((clinicalStatementList == null) || (clinicalStatementList.size() == 0))
		{
			return null;
		}

		java.util.List<Date> csDates = getListOfDatesFromListOfClinicalStatements(clinicalStatementList, highLow);

		java.util.Collections.sort(csDates); // ascending order

		if (csDates.size() == 0)
		{
			return null;
		}
		else
		{
			if ((earliestLatest != null) && (earliestLatest.equalsIgnoreCase("<"))) // earliest
			{
				return csDates.get(0);
			}
			else if ((earliestLatest != null) && (earliestLatest.equalsIgnoreCase(">"))) // latest
			{
				return csDates.get(csDates.size() - 1);
			}
			else
			{
				System.err.println(">> Error in GetEarliestOrLatestDateFromClinicalStatementList: earliestLatest value of " + earliestLatest + " not recognized.  Processing as earliest.");
				return csDates.get(0);
			}
			
		}
	}
	
	
	
	/** getEarliestOrLatestDateFromProcedureList
	 * @param procedureEventList
	 * @param highLow
	 * @param earliestLatest
	 * @return earliest or latest encounter low or high data as specified
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.Date getEarliestOrLatestDateFromProcedureList(List procedureEventList, String highLow, String earliestLatest) 
	{
//	/*
//	Returns earliest or latest date in procedure event list.
//	Returns null if list is null or empty.
//	highLow must be "High" or "Low" and designates whether to use procedureTime low or high times.
//	earliestLatest must be "<" for earliest or ">" for latest 
//	If a date is null for a procedure, it is ignored for the purposes of this function.
//	*/
		if ((procedureEventList == null) || (procedureEventList.size() == 0))
		{
			return null;
		}

		java.util.ArrayList<java.util.Date> procDates = new java.util.ArrayList<java.util.Date>();

		for (ProcedureEvent proc : (List<ProcedureEvent>) procedureEventList)
		{
			IVLDate procTimeIVL = proc.getProcedureTime();
			if (procTimeIVL != null)
			{
				java.util.Date procDate = null;
				if ((highLow != null) && (highLow.equalsIgnoreCase("Low")))
				{
					procDate = procTimeIVL.getLow();
					
				}
				else if ((highLow != null) && (highLow.equalsIgnoreCase("High")))
				{
					procDate = procTimeIVL.getHigh();				
				}
				else
				{
					System.err.println(">> Error in GetEarliestOrLatestDateFromProcedureList: highLow value of " + highLow + " not recognized.  Processing as Low.");
					procDate = procTimeIVL.getLow();
				}

				if (procDate != null)
				{
					procDates.add(procDate);
				}
			}
		}

		java.util.Collections.sort(procDates); // ascending order

		if (procDates.size() == 0)
		{
			return null;
		}
		else
		{
			if ((earliestLatest != null) && (earliestLatest.equalsIgnoreCase("<"))) // earliest
			{
				return procDates.get(0);
			}
			else if ((earliestLatest != null) && (earliestLatest.equalsIgnoreCase(">"))) // latest
			{
				return procDates.get(procDates.size() - 1);
			}
			else
			{
				System.err.println(">> Error in GetEarliestOrLatestDateFromProcedureList: earliestLatest value of " + earliestLatest + " not recognized.  Processing as earliest.");
				return procDates.get(0);
			}
			
		}
	}
	
	
	/** getEncListWithNoTimeOverlap
	 * @param encListSource
	 * @param encListOverlapCheck
	 * @return List of non-overlapped encounters present in two separate Lists of encounters
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static List getEncListWithNoTimeOverlap(List encListSource, List encListOverlapCheck) 
	{
//	/* 
//	Creates new List that returns contents of encListSource which do not have overlapping encounterEventTimes in encListOverlapCheck.
//
//	Does not alter input lists.
//
//	Returns an empty list if no matches or if encListSource is null.
//	*/
		List listToReturn = new ArrayList();
		if (encListSource != null)
		{
			for (EncounterEvent encSource : (List<EncounterEvent>) encListSource) 
			{
				boolean overlap = false;
				IVLDate ivlDateSource = encSource.getEncounterEventTime();

				if (encListOverlapCheck != null)
				{
					for (EncounterEvent encCheck: (List<EncounterEvent>) encListOverlapCheck) 
					{
						IVLDate ivlDateCheck = encCheck.getEncounterEventTime();
						if(timeIntervalsOverlap(ivlDateSource , ivlDateCheck ))
						{
							overlap = true;
						}		
					}
				}

				if (! overlap)
				{
					listToReturn.add(encSource );
				}		
			} 
		}	
		return listToReturn;
	}
	

//	RETIRED
//	/** getEncounterConceptListToInsertFromProblemConcepts
//	 * @param encounterTypeConcepts
//	 * @param clinicalStatementRelationships
//	 * @param problemConcepts
//	 * @return
//	 */
//	java.util.List getEncounterConceptListToInsertFromProblemConcepts(Set encounterTypeConcepts, Set clinicalStatementRelationships, Set problemConcepts) 
//	{
//	/*
//		Input requirements:
//			encounterTypeConcepts are a set  of EncounterTypeConcepts in memory
//			clincialStatementRelationships are a set of ClinicalStatementRelationships where the source is an encounter and the relationship is as specified
//			problemConcepts are concepts which are related to encounters in the specified manner 		
//		Returns list of encounterTypeConcepts that should be added to encounters as follows:
//			For each problemConcept
//				1. Find the encounter it is related to
//				2. If the encounter does not already have an encounter type concept which is the same concept as the problem concept, and if this concept has not already been added for this encounter, add the encounterConcept (with the appropriate encounterId) to what should be added			
//		May returns an empty list if no matches made.
//	*/	
//		Set<String> etcSet = new HashSet<String>(); // set String = Encounter Type Concept code + "|" + concept target Id
//		Map<String, String> csrTargetIdToSourceIdMap = new HashMap<String, String>(); // key = targetId, target = sourceId asociated with the targetId  
//			
//		java.util.List<EncounterTypeConcept> listToReturn = new java.util.ArrayList<EncounterTypeConcept>();
//		
//		if ((clinicalStatementRelationships == null) || (clinicalStatementRelationships.size() == 0))
//		{
//			//System.out.println("clinicalStatementRelationships=null or empty" );
//			return listToReturn;
//		}
//		
//		if ((problemConcepts == null) || (problemConcepts.size() == 0))
//		{
//			//System.out.println("problemConcepts=null or empty" );
//			return listToReturn;
//		}
//		
//		if (encounterTypeConcepts == null)
//		{
//			//System.out.println("encounterTypeConcepts=null" );
//		} else {
//			//System.out.println("encounterTypeConcepts=" + encounterTypeConcepts.size());
//		}
//		
//					
//		//System.out.println("problemConcepts=" + problemConcepts.size());
//		//System.out.println("clinicalStatementRelationships=" + clinicalStatementRelationships.size());
//		
//		if (encounterTypeConcepts != null)
//		{
//			for (EncounterTypeConcept etc : (Set<EncounterTypeConcept>) encounterTypeConcepts) 
//			{
//				String etcHash = etc.getOpenCdsConceptCode() + "|" + etc.getConceptTargetId();
//				etcSet.add(etcHash);
//			}
//		}
//
//		// populate lookup map
//		for (ClinicalStatementRelationship csr : (Set<ClinicalStatementRelationship>)clinicalStatementRelationships)
//		{
//			csrTargetIdToSourceIdMap.put(csr.getTargetId(), csr.getSourceId());
//		}	
//		
//		// For each problemConcept	
//		for (ProblemConcept pc : (Set<ProblemConcept>) problemConcepts)
//		{
//			String pcConceptCode = pc.getOpenCdsConceptCode();
//			String pcConceptTargetId = pc.getConceptTargetId();
//			String pcDTMC = pc.getDeterminationMethodCode();
//			//String pcDN = pc.getDisplayName();
//			String pcConceptId = pc.getId();
//			
//			// 1. Find the encounter the problem is related to			
//			String encId = csrTargetIdToSourceIdMap.get(pcConceptTargetId);
//			
//			// 2. If the encounter does not already have an encounter type concept which is the same concept as the problem concept, and if this concept has not already been added for this encounter, add the encounterTypeConcepts (with the appropriate encounterId) to what should be added			
//			String candidateEncounterTypeConceptHash = pcConceptCode + "|" + encId;
//			if (! etcSet.contains(candidateEncounterTypeConceptHash))
//			{
//				EncounterTypeConcept newEtc = new EncounterTypeConcept();
//				newEtc.setConceptTargetId(encId);
//				newEtc.setOpenCdsConceptCode(pcConceptCode);
//				newEtc.setDeterminationMethodCode(pcDTMC);
//				//newEtc.setDisplayName(pcDN);
//				newEtc.setId(pcConceptId + "^generated"); 
//				listToReturn.add(newEtc);
//						
//				//now add it to hashset, so we don't try to create it again...
//				etcSet.add(candidateEncounterTypeConceptHash);			
//			}
//		}
//			
//		//System.out.println("newEncTypeConcepts=" + listToReturn.size());
//		return listToReturn;		
//	}
	
	
// RETIRED	
//	/** getEncounterConceptListToInsertFromProcedureConcepts
//	 * @param encounterTypeConcepts
//	 * @param clinicalStatementRelationships
//	 * @param procedureConcepts
//	 * @return
//	 */
//	java.util.List getEncounterConceptListToInsertFromProcedureConcepts(Set encounterTypeConcepts, Set clinicalStatementRelationships, Set procedureConcepts) 
//	{
//	/*
//		Input requirements:
//			encounterTypeConcepts are a set  of EncounterTypeConcepts in memory
//			clincialStatementRelationships are a set of ClinicalStatementRelationships where the source is an encounter and the relationship is as specified
//			procedureConcepts are concepts which are related to encounters in the specified manner 		
//		Returns list of encounterTypeConcepts that should be added to encounters as follows:
//			For each procedureConcept
//				1. Find the encounter it is related to
//				2. If the encounter does not already have an encounter type concept which is the same concept as the procedure concept, and if this concept has not already been added for this encounter, add the encounterConcept (with the appropriate encounterId) to what should be added			
//		May returns an empty list if no matches made.
//	*/	
//		Set<String> etcSet = new HashSet<String>(); // set String = Encounter Type Concept code + "|" + concept target Id
//		Map<String, String> csrTargetIdToSourceIdMap = new HashMap<String, String>(); // key = targetId, target = sourceId asociated with the targetId  
//			
//		java.util.List<EncounterTypeConcept> listToReturn = new java.util.ArrayList<EncounterTypeConcept>();
//		
//		if ((clinicalStatementRelationships == null) || (clinicalStatementRelationships.size() == 0))
//		{
//			//System.out.println("clinicalStatementRelationships=null or empty" );
//			return listToReturn;
//		}
//		
//		if ((procedureConcepts == null) || (procedureConcepts.size() == 0))
//		{
//			//System.out.println("procedureConcepts=null or empty" );
//			return listToReturn;
//		}
//		
//		if (encounterTypeConcepts == null)
//		{
//			//System.out.println("encounterTypeConcepts=null" );
//		} else {
//			//System.out.println("encounterTypeConcepts=" + encounterTypeConcepts.size());
//		}
//		
//					
//		//System.out.println("procedureConcepts=" + procedureConcepts.size());
//		//System.out.println("clinicalStatementRelationships=" + clinicalStatementRelationships.size());
//		
//		if (encounterTypeConcepts != null)
//		{
//			for (EncounterTypeConcept etc : (Set<EncounterTypeConcept>) encounterTypeConcepts) 
//			{
//				String etcHash = etc.getOpenCdsConceptCode() + "|" + etc.getConceptTargetId();
//				etcSet.add(etcHash);
//			}
//		}
//
//		// populate lookup map
//		for (ClinicalStatementRelationship csr : (Set<ClinicalStatementRelationship>)clinicalStatementRelationships)
//		{
//			csrTargetIdToSourceIdMap.put(csr.getTargetId(), csr.getSourceId());
//		}	
//		
//		// For each procedureConcept	
//		for (ProcedureConcept pc : (Set<ProcedureConcept>) procedureConcepts)
//		{
//			String pcConceptCode = pc.getOpenCdsConceptCode();
//			String pcConceptTargetId = pc.getConceptTargetId();
//			String pcDTMC = pc.getDeterminationMethodCode();
//			//String pcDN = pc.getDisplayName();
//			String pcConceptId = pc.getId();
//			
//			// 1. Find the encounter the procedure is related to			
//			String encId = csrTargetIdToSourceIdMap.get(pcConceptTargetId);
//			
//			// 2. If the encounter does not already have an encounter type concept which is the same concept as the procedure concept, and if this concept has not already been added for this encounter, add the encounterTypeConcepts (with the appropriate encounterId) to what should be added			
//			String candidateEncounterTypeConceptHash = pcConceptCode + "|" + encId;
//			if (! etcSet.contains(candidateEncounterTypeConceptHash))
//			{
//				EncounterTypeConcept newEtc = new EncounterTypeConcept();
//				newEtc.setConceptTargetId(encId);
//				newEtc.setOpenCdsConceptCode(pcConceptCode);
//				newEtc.setDeterminationMethodCode(pcDTMC);
//				//newEtc.setDisplayName(pcDN);
//				newEtc.setId(pcConceptId + "^generated"); 
//				listToReturn.add(newEtc);
//						
//				//now add it to hashset, so we don't try to create it again...
//				etcSet.add(candidateEncounterTypeConceptHash);			
//			}
//		}
//			
//		//System.out.println("newEncTypeConcepts=" + listToReturn.size());
//		return listToReturn;		
//	}

	
	
	/** getEncounterListSortedByHighDateAndIdAscending
	 * @param encounterEventListUnchanged
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getEncounterListSortedByHighDateAndIdAscending(java.util.List encounterEventListUnchanged)
//	/**
//	 * Returns encounter event list sorted by high date and secondarily by id.  Returns null if source list is null or empty.
//	 * 
//	 * If the required date is null for an encounter, it is ignored for the purposes of this function and not included in the list returned.
//	 * 
//	 * Returns empty list if no qualifying encounters or input list is null. 
//	 * @param encounterEventListUnchanged	Input encounters.  May be null or empty -- will just return an empty list.
//	 * @return
//	 */
	{
		java.util.List listToReturn = new java.util.ArrayList(); 
		
		if ((encounterEventListUnchanged == null) || (encounterEventListUnchanged.size() == 0))
		{
			return listToReturn;
		}
		
		for (EncounterEvent inputEnc : (java.util.List<EncounterEvent>) encounterEventListUnchanged)
		{
			IVLDate inputEncIvlDate = inputEnc.getEncounterEventTime();
			if (inputEncIvlDate != null)
			{
				java.util.Date inputEncDate = inputEncIvlDate.getHigh();
				if (inputEncDate != null)
				{
					listToReturn.add(inputEnc);
				}				
			}
		}
		
		// sort EncounterEvents by ascending date.  If a tie, sort by id.
		java.util.Collections.sort(listToReturn, new java.util.Comparator<EncounterEvent>() 
		{
			public int compare(EncounterEvent e1, EncounterEvent e2) 
			{
				int dateComparisonResult = 0;
					
				java.util.Date e1Date = e1.getEncounterEventTime().getHigh();
				java.util.Date e2Date = e2.getEncounterEventTime().getHigh();
				if (e1Date.before(e2Date))
				{
					dateComparisonResult = -1;
				}
				else if (e1Date.after(e2Date))
				{
					dateComparisonResult = 1;
				}						
					
				if (dateComparisonResult != 0)
				{
					return dateComparisonResult;
				}
				else
				{
					int idComparisonResult = 0;
						
					String e1id = e1.getId();
					String e2id = e2.getId();
					
					if ((e1id != null) && (e2id != null))
					{
						idComparisonResult = e1id.compareTo(e2id);
					}
					return idComparisonResult;
				}					
			}
		});
		return listToReturn;
	}
	
	
	/** getEncounterListSortedByLowDateAndIdAscending
	 * @param encounterEventListUnchanged
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getEncounterListSortedByLowDateAndIdAscending(java.util.List encounterEventListUnchanged)
//	/**
//	 * Returns encounter event list sorted by lowdate and secondarily by id.  Returns null if source list is null or empty.
//	 * 
//	 * If the required date is null for an encounter, it is ignored for the purposes of this function and not included in the list returned.
//	 * 
//	 * Returns empty list if no qualifying encounters or input list is null. 
//	 * @param encounterEventListUnchanged	Input encounters.  May be null or empty -- will just return an empty list.
//	 * @return
//	 */
	{
		java.util.List listToReturn = new java.util.ArrayList(); 
		
		if ((encounterEventListUnchanged == null) || (encounterEventListUnchanged.size() == 0))
		{
			return listToReturn;
		}
		
		for (EncounterEvent inputEnc : (java.util.List<EncounterEvent>) encounterEventListUnchanged)
		{
			IVLDate inputEncIvlDate = inputEnc.getEncounterEventTime();
			if (inputEncIvlDate != null)
			{
				java.util.Date inputEncDate = inputEncIvlDate.getLow();
				if (inputEncDate != null)
				{
					listToReturn.add(inputEnc);
				}				
			}
		}
		
		// sort EncounterEvents by ascending date.  If a tie, sort by id.
		java.util.Collections.sort(listToReturn, new java.util.Comparator<EncounterEvent>() 
		{
			public int compare(EncounterEvent e1, EncounterEvent e2) 
			{
				int dateComparisonResult = 0;
					
				java.util.Date e1Date = e1.getEncounterEventTime().getLow();
				java.util.Date e2Date = e2.getEncounterEventTime().getLow();
				if (e1Date.before(e2Date))
				{
					dateComparisonResult = -1;
				}
				else if (e1Date.after(e2Date))
				{
					dateComparisonResult = 1;
				}						
					
				if (dateComparisonResult != 0)
				{
					return dateComparisonResult;
				}
				else
				{
					int idComparisonResult = 0;
						
					String e1id = e1.getId();
					String e2id = e2.getId();
					
					if ((e1id != null) && (e2id != null))
					{
						idComparisonResult = e1id.compareTo(e2id);
					}
					return idComparisonResult;
				}					
			}
		});
		return listToReturn;
	}
		

	/** getFormattedDateStringFromDate
	 * @param thisDate
	 * @param nullLabel
	 * @param formatString
	 * @return String containing formatted date, using specified format
	 */
	public static String getFormattedDateStringFromDate(java.util.Date thisDate, String nullLabel, String formatString) 
	{
	
//	accepts thisDate, and builds a formatted date string .
//	substitutes the submitted param "nullLabel" for the date value when the date value is null.
//
//	Examples using nullLabel = "null" and formatString = "yyyy-MM-dd HH:mm:ss" 
//		"01/29/2014 15:45:55"  
//		"null"

	
		if (thisDate == null) return nullLabel;

		java.text.SimpleDateFormat format = new java.text.SimpleDateFormat(formatString);
		
		return format.format( thisDate );
	}
		

	/** getFormattedDateStringFromIVLDate
	 * 
	 * @param thisIvl
	 * @param highLowBoth
	 * @param prependClassLabel
	 * @param classLabel
	 * @param lowLabel
	 * @param highLabel
	 * @param bothSeparator
	 * @param nullLabel
	 * @param formatString
	 * @return String representing formatted date
	 */
	public static String getFormattedDateStringFromIVLDate(IVLDate thisIvl, String highLowBoth, boolean prependClassLabel, String classLabel, String lowLabel, String highLabel, String bothSeparator, String nullLabel, String formatString) {
//	/*
//	accepts IVLDate, and build a date string from either the high or the low date, or both, depending on the value of highLowBoth.
//	substitutes the submitted param "nullLabel" for the date value when the date value is null.
//	identifies whether the value is the low or high component of the interval using the submitted params for lowLabel and highLabel.
//	separates the two date values with the submitted param for bothLabel when both dates are requested.
//	returns an empty string if the entire submitted IVLDate is null.
//
//	Examples using prependClassLabel = true, classLabel = "proc-", lowLabel = "low:", highLabel = "high:", bothSeparator = "-", nullLabel = "null", formatString = "yyyy-MM-dd" 
//		"proc-low:2014-01-29"  
//		"proc-high:2014-02-04"
//		"proc-low:2014-01-29-high:2014-02-04"
//		"proc-low:null"
//		"proc-high:null"
//		"proc-low:null-high:2014-02-04"
//		"proc-low:2014-01-29-high:null"
//		"proc-low:null-high:null"
//
//	*/

		if (thisIvl == null) return "";

		String classLabelFinal = (prependClassLabel) ? classLabel : "";
		java.text.SimpleDateFormat format = new java.text.SimpleDateFormat(formatString);
		
		String lowDate = "";
		if (thisIvl.getLow() == null) {
			lowDate = lowLabel + nullLabel;
		} else {
			lowDate = lowLabel + format.format( thisIvl.getLow() );
		}
		
		String highDate = "";
		if (thisIvl.getHigh() == null) {
			highDate = highLabel + nullLabel;
		} else {
			highDate = highLabel + format.format( thisIvl.getHigh() );
		}
		
		if ("Low".equals(highLowBoth)) {
			return classLabelFinal + lowDate;
		} else if ("High".equals(highLowBoth)) {
			return classLabelFinal + highDate;
		} else if ("Both".equals(highLowBoth)) {
			return classLabelFinal + lowDate + bothSeparator + highDate;
		} else 
			return "";
	}	
	
	
	/** getIVLDateListFromEncList
	 * @param encList
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getIVLDateListFromEncList	(java.util.List encList) 
//	/* 
//	Returns encounterEventTimes from encList.  Will return empty list if no encounters in input list or input list is null.
//	Pre-conditions:  if populated, encList must contain elements of type EncounterEvent.
//	*/
	{
		java.util.List<IVLDate> listToReturn = new java.util.ArrayList<IVLDate>();
		
		if (encList != null)
		{
			for (EncounterEvent enc : (java.util.List<EncounterEvent>) encList) 
			{
				IVLDate ivlDate = enc.getEncounterEventTime();
				if (ivlDate != null)
				{
					listToReturn.add(ivlDate);
				}
			}
		}
		return listToReturn;
	}
	
	
	/** getIdListFromClinicalStatementList
	 * @param clinicalStatementList
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getIdListFromClinicalStatementList(List clinicalStatementList) 
	{
//	/*
//		Returns ids of clinical statements in a list.
//		Returns an empty list if input is null or empty.
//	*/
		java.util.List<String> listToReturn = new java.util.ArrayList<String>();
		if ((clinicalStatementList == null) || (clinicalStatementList.size() == 0))
		{
			return listToReturn;
		}
		
		for (ClinicalStatement cs : (List<ClinicalStatement>) clinicalStatementList)
		{
			listToReturn.add(cs.getId());
		}
		
		return listToReturn;		
	}
	
	
	/** getIdListFromClinicalStatementRelationshipList
	 * @param clinicalStatementRelationshipList
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getIdListFromClinicalStatementRelationshipList(List clinicalStatementRelationshipList) 
	{
//	/*
//		Returns ids of clinical statement relationships in a list.
//		Returns an empty list if input is null or empty.
//	*/
		java.util.List<String> listToReturn = new java.util.ArrayList<String>();
		if ((clinicalStatementRelationshipList == null) || (clinicalStatementRelationshipList.size() == 0))
		{
			return listToReturn;
		}
		
		for (ClinicalStatementRelationship csr : (List<ClinicalStatementRelationship>) clinicalStatementRelationshipList)
		{
			listToReturn.add(csr.getId());
		}
		
		return listToReturn;		
	}
	
	
	/** getIdOfEarliestEncounterFromEncounterList
	 * @param encounterEventList
	 * @param highLow
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static String getIdOfEarliestEncounterFromEncounterList(List encounterEventList, String highLow) 
	{
//	/*
//		Returns ID of the earliest encounter in encounter event list.
//		Returns null if list is null or empty.
//		highLow must be "High" or "Low" and designates whether to use encounterEventTime low or high times.
//		If a date is null for an encounter, it is ignored for the purposes of this function.
//		If there are two or more encounters with the same date/time, the ID of the first encounter in the list with that date/time will be returned.
//	*/
		if ((encounterEventList == null) || (encounterEventList.size() == 0))
		{
			return null;
		}

		java.util.Date earliestDate = getEarliestDateFromEncounterList(encounterEventList, highLow);

		if (earliestDate != null)
		{
			for (EncounterEvent enc : (List<EncounterEvent>) encounterEventList)
			{
				IVLDate encEventTime = enc.getEncounterEventTime();
				if (encEventTime != null)
				{
					java.util.Date encDate = null;
					if (highLow.equalsIgnoreCase("Low"))
					{
						encDate = encEventTime.getLow();				
					}
					else if (highLow.equalsIgnoreCase("High"))
					{
						encDate = encEventTime.getHigh();				
					}
					else
					{
						System.err.println(">> Error in GetIdOfEarliestDateFromEncounterList: highLow value of " + highLow + " not recognized.  Processing as Low.");
						encDate = encEventTime.getLow();
					}

					if (encDate.equals(earliestDate))
					{
						return enc.getId();
					}
				}
			}
		}

		return null;
	}
	
	
	/**
	 * Returns a Set containing the IDs of encounters that have the minimum separation indicated.
	 * 
	 * First, sorts Encounters by low time.  Then, adds to set as long as separation condition is fulfilled.  
	 * 
	 * If two encounters have the exact same time, uses the string compareTo funciton on the identifier to get a consistent "winner" for inclusion.
	 * 
	 * Returns an empty set rather than null if no matching encounters. 
	 * @param encounters	Input encounters.  May be null or empty -- will just return an empty set.
	 * @param highLow		"High" or "Low" to indicate which time to use
	 * @param minSeparation	
	 * @param timeUnits		Java calendar time
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.Set getIdSetOfEncountersWithMinimumSeparation(java.util.Set encounters, String highLow, int minSeparation, int timeUnits)
	{
		java.util.Set<String> setToReturn = new java.util.HashSet<String>();
		
		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance(); 
		
		if ((encounters == null) || (encounters.size() == 0))
		{
			return setToReturn;
		}
		
		java.util.List<EncounterEvent> encounterList = new java.util.ArrayList<EncounterEvent>((java.util.Set<EncounterEvent>)encounters);
		
		// sort EncounterEvents by ascending date.  If a tie, sort by id.
		if ((highLow != null) && (highLow.equals("High")))
		{
			java.util.Collections.sort
			(
				encounterList, 
				new java.util.Comparator<EncounterEvent>() 
				{
					public int compare(EncounterEvent e1, EncounterEvent e2) 
					{
						int dateComparisonResult = 0;
						
						IVLDate e1DateInterval = e1.getEncounterEventTime();
						IVLDate e2DateInterval = e2.getEncounterEventTime();
						
						if ((e1DateInterval != null) && (e2DateInterval!= null))
						{
							java.util.Date e1Date = e1DateInterval.getHigh();
							java.util.Date e2Date = e2DateInterval.getHigh();
							
							if ((e1Date != null) && (e2Date != null))
							{
								if (e1Date.before(e2Date))
								{
									dateComparisonResult = -1;
								}
								else if (e1Date.after(e2Date))
								{
									dateComparisonResult = 1;
								}
							}
						}					
						
						if (dateComparisonResult != 0)
						{
							return dateComparisonResult;
						}
						else
						{
							int idComparisonResult = 0;
							
							String e1id = e1.getId();
							String e2id = e2.getId();
							
							if ((e1id != null) && (e2id != null))
							{
								idComparisonResult = e1id.compareTo(e2id);
							}
							return idComparisonResult;
						}					
					}
				}
			);			
		}
		else
		{
			java.util.Collections.sort(encounterList, new java.util.Comparator<EncounterEvent>() 
			{
				public int compare(EncounterEvent e1, EncounterEvent e2) 
				{
					int dateComparisonResult = 0;
					
					IVLDate e1DateInterval = e1.getEncounterEventTime();
					IVLDate e2DateInterval = e2.getEncounterEventTime();
					
					if ((e1DateInterval != null) && (e2DateInterval!= null))
					{
						java.util.Date e1Date = e1DateInterval.getLow();
						java.util.Date e2Date = e2DateInterval.getLow();
						
						if ((e1Date != null) && (e2Date != null))
						{
							if (e1Date.before(e2Date))
							{
								dateComparisonResult = -1;
							}
							else if (e1Date.after(e2Date))
							{
								dateComparisonResult = 1;
							}
						}
					}					
					
					if (dateComparisonResult != 0)
					{
						return dateComparisonResult;
					}
					else
					{
						int idComparisonResult = 0;
						
						String e1id = e1.getId();
						String e2id = e2.getId();
						
						if ((e1id != null) && (e2id != null))
						{
							idComparisonResult = e1id.compareTo(e2id);
						}
						return idComparisonResult;
					}					
				}
			});
		}
		
		
		// cycle through encounters and add to set to return if the date has passed the minimum difference specified from the last added one
		
		java.util.Date lastAddedDate = null;
		
		for (EncounterEvent enc : encounterList)
		{
			IVLDate ivlDate = enc.getEncounterEventTime();
			if (ivlDate != null)
			{
				java.util.Date encDate = null;
				String encId = enc.getId();
				if ((highLow != null) && (highLow.equals("High")))
				{
					encDate = ivlDate.getHigh();
				}
				else
				{
					encDate = ivlDate.getLow();
				}
				
				if ((encDate != null) && (encId != null))
				{
					if (lastAddedDate == null)
					{
						lastAddedDate = encDate;
						setToReturn.add(encId);
					}
					else if (! encDate.before(dateUtility.getDateAfterAddingTime(lastAddedDate, timeUnits, minSeparation)))
					{
						// ! before is the same as "on or after"
						// e.g., 
						// lastAddedDate = 1/1/2011.  Min separate is 10 days.  Then the threshold date is 1/11/2011.
						// This resolves to true as long as the next date is at least 1/11/2011, because then it will not be before the threshold date.
						lastAddedDate = encDate;
						setToReturn.add(encId);
					}
				}				
			}
		}
		
		return setToReturn;
	}
	
	
	/** getLatestDateFromEncounterList
	 * @param encounterEventList
	 * @param highLow
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.Date getLatestDateFromEncounterList(List encounterEventList, String highLow) 
	{
//	/*
//		Returns latest date in encounter event list.
//		Returns null if list is null or empty.
//		highLow must be "High" or "Low" and designates whether to use encounterEventTime low or high times.
//		If a date is null for an encounter, it is ignored for the purposes of this function.
//	*/
		if ((encounterEventList == null) || (encounterEventList.size() == 0))
		{
			return null;
		}

		java.util.ArrayList<java.util.Date> encounterDates = new java.util.ArrayList<java.util.Date>();

		for (EncounterEvent enc : (List<EncounterEvent>) encounterEventList)
		{
			IVLDate encEventTime = enc.getEncounterEventTime();
			if (encEventTime != null)
			{
				java.util.Date encDate = null;
				if (highLow.equalsIgnoreCase("Low"))
				{
					encDate = encEventTime.getLow();
					
				}
				else if (highLow.equalsIgnoreCase("High"))
				{
					encDate = encEventTime.getHigh();				
				}
				else
				{
					System.err.println(">> Error in GetLatestDateFromEncounterList: highLow value of " + highLow + " not recognized.  Processing as Low.");
					encDate = encEventTime.getLow();
				}

				if (encDate != null)
				{
					encounterDates.add(encDate);
				}
			}
		}

		java.util.Collections.sort(encounterDates); // ascending order

		if (encounterDates.size() == 0)
		{
			return null;
		}
		else
		{
			return encounterDates.get(encounterDates.size() - 1);
		}
	}
	
	
	/** getLatestEncounterFromEncounterList
	 * @param encounterEventList
	 * @param highLow
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static EncounterEvent getLatestEncounterFromEncounterList(List encounterEventList, String highLow) 
	{
//	/*
//		Returns latest encounter in encounter event list.
//		Returns null if list is null or empty.
//		highLow must be "High" or "Low" and designates whether to use encounterEventTime low or high times.
//		If a date is null for an encounter, it is ignored for the purposes of this function.
//		If there are two or more encounters with the same date/time, returns the encounter with the lowest identifier by string comparison.
//	*/
		if ((encounterEventList == null) || (encounterEventList.size() == 0))
		{
			return null;
		}
				
		
		if ((highLow != null) && highLow.equals("High"))
		{
			java.util.List<EncounterEvent> sortedEncList = (java.util.List<EncounterEvent>) getEncounterListSortedByHighDateAndIdAscending(encounterEventList);
			return sortedEncList.get(sortedEncList.size() - 1);
		}
		else
		{
			java.util.List<EncounterEvent> sortedEncList = (java.util.List<EncounterEvent>) getEncounterListSortedByLowDateAndIdAscending(encounterEventList);
			return sortedEncList.get(sortedEncList.size() - 1);
		}
	}
	
	
//	/** getListOfDatesAsSortedFormattedStringFromListOfClinicalStatements replaced by getStandardPrintDateListFromListOfClinicalStatements
//	 * 
//	 * @param cSList
//	 * @param highLowBoth
//	 * @param formatString
//	 * @return
//	 */
//	@SuppressWarnings("rawtypes")
//	public static String getListOfDatesAsSortedFormattedStringFromListOfClinicalStatements(java.util.List cSList, String highLowBoth)
//	{
//	/*
//	returns list of dates, separated by spaces, of either low or high times, or both, from all supported clinicalStatements in the list
//	returns empty string if the list is empty
//	returns an error message within the list if a clinicalStatement is not supported in the list below
//	*/
//	
//		java.util.List<IVLDate> listOfDates = new java.util.ArrayList<IVLDate>();
//		
//		for (Object each : cSList) {
//			if ("EncounterEvent".equals( each.getClass().getSimpleName() ) ) {
//				if (((EncounterEvent)each).getEncounterEventTime() != null) {
//					listOfDates.add( ((EncounterEvent)each).getEncounterEventTime() );
//				}
//			} else if ("ProcedureEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((ProcedureEvent)each).getProcedureTime() != null) {
//					listOfDates.add( ((ProcedureEvent)each).getProcedureTime() );
//				}
//			} else if ("Problem".equals(each.getClass().getSimpleName()) ) {
//				if (((Problem)each).getProblemEffectiveTime() != null) {
//					listOfDates.add( ((Problem)each).getProblemEffectiveTime() );
//				}
//			} else if ("SubstanceDispensationEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((SubstanceDispensationEvent)each).getDispensationTime() != null) {
//					listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime() );
//				}
//			} else if ("SubstanceAdministrationEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() != null) {
//					listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() );
//				}
//			} else if ("ObservationResult".equals(each.getClass().getSimpleName()) ) {
//				if (((ObservationResult)each).getObservationEventTime() != null) {
//					listOfDates.add( ((ObservationResult)each).getObservationEventTime() );
//				}
//			} else {
//				//error condition, unsupported ClinicalStatement
//				//listOfDates.add( "Unsupported vMR Class: " + each.getClass().getSimpleName() + ", unable to locate date values for id: " + ((ClinicalStatement)each).getId() );
//			}
//		}
//					
//		return getStandardPrintDateListFromIVLDateList(listOfDates, highLowBoth); 
//	}
	
	
	
//	/** getListOfDatesAsSortedStringFromListOfClinicalStatements
//	 * 
//	 * @param cSList
//	 * @param highLowBoth
//	 * @return List of dates as sorted string (dates are in ascending order)
//	 */
//	public static String getListOfDatesAsSortedStringFromListOfClinicalStatementsOld(@SuppressWarnings("rawtypes") java.util.List cSList, String highLowBoth)
//	{       
////	/*
////	returns list of dates, separated by spaces, of either low or high times, or both, from all supported clinicalStatements in the list
////	returns empty string if the list is empty
////	returns an error message within the list if a clinicalStatement is not supported in the list below
////	*/
//	
//		boolean prependClassLabel = false;	//tells whether to put a label in front of the date indicating what type of clinical statement the date came from
//		//String classLabel = "";
//		String lowLabel = "";			//label prefix for the low date, e.g., "low:", "admit:", "start:", etc.
//		String highLabel = "";			//label prefix for the high date, e.g., "high:", "dischg:", "end:", etc.
//		String bothLabel = "-";			//label separator for use when both low and high dates are requested, e.g., "-", " ", etc.
//		String nullLabel = "null";		//label for date value when it is null, e.g., "null", "", " ", "missing", etc.
//		String dateSeparator 	= ", ";		//separates the dates from one individual clinical statement, e.g., " ", ", ", etc.
//		String formatString	= "yyyy-MM-dd";
//
//		java.util.List<String> listOfDates = new java.util.ArrayList<String>();
//		
//		for (Object each : cSList) {
//			if ("EncounterEvent".equals( each.getClass().getSimpleName() ) ) {
//				if (((EncounterEvent)each).getEncounterEventTime() != null) {
//					String classLabel = ""; //"enc-";
//					listOfDates.add( getFormattedDateStringFromIVLDate(((EncounterEvent)each).getEncounterEventTime(), highLowBoth, prependClassLabel, classLabel, lowLabel, highLabel, bothLabel, nullLabel, formatString ) );
//				}
//			} else if ("ProcedureEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((ProcedureEvent)each).getProcedureTime() != null) {
//					String classLabel = ""; //"proc-";
//					listOfDates.add( getFormattedDateStringFromIVLDate(((ProcedureEvent)each).getProcedureTime(), highLowBoth, prependClassLabel, classLabel, lowLabel, highLabel, bothLabel, nullLabel, formatString ) );
//				}
//			} else if ("Problem".equals(each.getClass().getSimpleName()) ) {
//				if (((Problem)each).getProblemEffectiveTime() != null) {
//					String classLabel = ""; //"prob-";
//					listOfDates.add( getFormattedDateStringFromIVLDate(((Problem)each).getProblemEffectiveTime(), highLowBoth, prependClassLabel, classLabel, lowLabel, highLabel, bothLabel, nullLabel, formatString ) );
//				}
//			} else if ("SubstanceDispensationEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((SubstanceDispensationEvent)each).getDispensationTime() != null) {
//					String classLabel = ""; //"subDisp-";
//					listOfDates.add( getFormattedDateStringFromIVLDate(((SubstanceDispensationEvent)each).getDispensationTime(), highLowBoth, prependClassLabel, classLabel, lowLabel, highLabel, bothLabel, nullLabel, formatString ) );
//				}
//			} else if ("SubstanceAdministrationEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() != null) {
//					String classLabel = ""; //"subAdm-";
//					listOfDates.add( getFormattedDateStringFromIVLDate(((SubstanceAdministrationEvent)each).getAdministrationTimeInterval(), highLowBoth, prependClassLabel, classLabel, lowLabel, highLabel, bothLabel, nullLabel, formatString ) );
//				}
//			} else if ("ObservationResult".equals(each.getClass().getSimpleName()) ) {
//				if (((ObservationResult)each).getObservationEventTime() != null) {
//					String classLabel = ""; //"obs-";
//					listOfDates.add( getFormattedDateStringFromIVLDate(((ObservationResult)each).getObservationEventTime(), highLowBoth, prependClassLabel, classLabel, lowLabel, highLabel, bothLabel, nullLabel, formatString ) );
//				}
//			} else {
//				//error condition, unsupported ClinicalStatement
//				listOfDates.add( "Unsupported vMR Class: " + each.getClass().getSimpleName() + ", unable to locate date values for id: " + ((ClinicalStatement)each).getId() );
//			}
//		}
//			
//		java.util.Collections.sort(listOfDates);
//		
//		
//		java.lang.StringBuffer buffer = new java.lang.StringBuffer();
//		boolean firstTimeThru = true;
//		for (String each : listOfDates) {
//			if ( firstTimeThru ) { buffer.append(each); } else {buffer.append(dateSeparator + each); }
//			firstTimeThru = false;
//		}
//				
//		return buffer.toString();
//	}
	


	/** getListOfDatesAsSortedFormattedStringFromListOfDates
	 * 
	 * @param datesToFormat
	 * @return
	 */
	public static String getListOfDatesAsSortedFormattedStringFromListOfDates(java.util.List datesToFormat)
	/*
	returns formatted list of dates from all dates in the input datesToFormat list
	returns empty string if the date list is empty
	*/
	{

			return "[List<Date>]" + getStandardPrintDateListFromDateList(datesToFormat);
	}
	
	
//	/** getListOfDatesAsSortedFormattedStringFromNamedListOfDatesV2 deprecated
//	 * 
//	 * @param datesToFormat
//	 * @param nullLabel
//	 * @param dateSeparator
//	 * @param formatString
//	 * @return
//	 */
//	public static String getListOfDatesAsSortedFormattedStringFromNamedListOfDatesV2(java.util.List<Date> datesToFormat, String nullLabel, String dateSeparator, String formatString)
//	{
//		/*
//		returns formatted list of dates from all dates in the input datesToFormat list
//		returns empty string if the date list is empty
//			
//		String nullLabel = "null";		//label for date value when it is null, e.g., "null", "", " ", "missing", etc.
//		String dateSeparator = ", ";		//separates the dates from one individual clinical statement, e.g., " ", ", ", etc.
//		*/
//
//		return "[List<Date>]" + getStandardPrintDateListFromDateList(datesToFormat);
//	}
	
	
//	/** getListOfDatesAsSortedStringFromListOfClinicalStatements
//	 * @param cSList
//	 * @param highLowBoth
//	 * @return
//	 */
//	public static String getListOfDatesAsSortedStringFromListOfClinicalStatements(java.util.List cSList, String highLowBoth)
//	{
//		/*
//	returns list of dates, separated by spaces, of either low or high times, or both, from all supported clinicalStatements in the list
//	returns empty string if the list is empty
//	returns an error message within the list if a clinicalStatement is not supported in the list below
//	*/
//	
////		String dateSeparator 	= ", ";		//separates the dates from one individual clinical statement, e.g., " ", ", ", etc.
////		java.util.List<String> listOfDates = new java.util.ArrayList<String>();
//		java.util.List<IVLDate> listOfDates = new java.util.ArrayList<IVLDate>();
//		
//		for (Object each : cSList) {
//			if ("EncounterEvent".equals( each.getClass().getSimpleName() ) ) {
//				if (((EncounterEvent)each).getEncounterEventTime() != null) {
////					String classLabel = ""; //"enc-";
//					listOfDates.add( ((EncounterEvent)each).getEncounterEventTime() );
//				}
//			} else if ("ProcedureEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((ProcedureEvent)each).getProcedureTime() != null) {
////					String classLabel = ""; //"proc-";
//					listOfDates.add( ((ProcedureEvent)each).getProcedureTime() );
//				}
//			} else if ("Problem".equals(each.getClass().getSimpleName()) ) {
//				if (((Problem)each).getProblemEffectiveTime() != null) {
////					String classLabel = ""; //"prob-";
//					listOfDates.add( ((Problem)each).getProblemEffectiveTime() );
//				}
//			} else if ("SubstanceDispensationEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((SubstanceDispensationEvent)each).getDispensationTime() != null) {
////					String classLabel = ""; //"subDisp-";
//					listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime() );
//				}
//			} else if ("SubstanceAdministrationEvent".equals(each.getClass().getSimpleName()) ) {
//				if (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() != null) {
////					String classLabel = ""; //"subAdm-";
//					listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() );
//				}
//			} else if ("ObservationResult".equals(each.getClass().getSimpleName()) ) {
//				if (((ObservationResult)each).getObservationEventTime() != null) {
////					String classLabel = ""; //"obs-";
//					listOfDates.add( ((ObservationResult)each).getObservationEventTime() );
//				}
//			} else {
//				//error condition, unsupported ClinicalStatement
//				//listOfDates.add( "Unsupported vMR Class: " + each.getClass().getSimpleName() + ", unable to locate date values for id: " + ((ClinicalStatement)each).getId() );
//			}
//		}
//			
////		java.util.Collections.sort(listOfDates);
////		
////		java.lang.StringBuffer buffer = new java.lang.StringBuffer();
////		boolean firstTimeThru = true;
////		//for (String each : listOfDates) {
////		//	if ( firstTimeThru ) { buffer.append(each); } else {buffer.append(dateSeparator + each); }
////		//	firstTimeThru = false;
////		//}
////		String previousDate = "";
////		for (String each : listOfDates) {
////			if (!previousDate.equals(each)) {
////				if ( firstTimeThru ) { buffer.append(each); } else {buffer.append(dateSeparator + each); }
////				firstTimeThru = false;
////			}
////			previousDate = each;
////		}
////				
////		return buffer.toString();
//		
//		return getStandardPrintDateListFromDateList(listOfDates); 
//	}

	
	
	/** getListOfDatesFromListOfClinicalStatements
	 * @param cSList
	 * @param highLow
	 * @return
	 */
	public static java.util.List<java.util.Date> getListOfDatesFromListOfClinicalStatements(java.util.List<ClinicalStatement> cSList, String highLow)
	{
	/*
	returns list of dates from all supported clinicalStatements in the list
	returns empty string if the list is empty
	returns an error message within the list if a clinicalStatement is not supported in the list below
	*/

	java.util.List<Date> listOfDates = new java.util.ArrayList<Date>();

	for (Object each : cSList) {
		if ("EncounterEvent".equals( each.getClass().getSimpleName() ) ) {
			if (((EncounterEvent)each).getEncounterEventTime() != null) {
				//listOfDates.add( ("Low".equals(highLow) ? ((EncounterEvent)each).getEncounterEventTime().getLow() : ((EncounterEvent)each).getEncounterEventTime().getHigh() );
				if (("Low".equals(highLow) ) & (((EncounterEvent)each).getEncounterEventTime().getLow() != null) ) 
					listOfDates.add( ((EncounterEvent)each).getEncounterEventTime().getLow() );
				if (("High".equals(highLow) ) & (((EncounterEvent)each).getEncounterEventTime().getHigh() != null)) 
					listOfDates.add( ((EncounterEvent)each).getEncounterEventTime().getHigh() );
			}
		} else if ("ProcedureEvent".equals(each.getClass().getSimpleName()) ) {
			if (((ProcedureEvent)each).getProcedureTime() != null) {
				//listOfDates.add( ((ProcedureEvent)each).getProcedureTime() );
				if (("Low".equals(highLow) ) & (((ProcedureEvent)each).getProcedureTime().getLow() != null)) 
					listOfDates.add( ((ProcedureEvent)each).getProcedureTime().getLow() );
				if (("High".equals(highLow) ) & (((ProcedureEvent)each).getProcedureTime().getHigh() != null)) 
					listOfDates.add( ((ProcedureEvent)each).getProcedureTime().getHigh() );
			}
		} else if ("Problem".equals(each.getClass().getSimpleName()) ) {
			if (((Problem)each).getProblemEffectiveTime() != null) {
				//listOfDates.add( ((Problem)each).getProblemEffectiveTime() );
				if (("Low".equals(highLow) ) & (((Problem)each).getProblemEffectiveTime().getLow() != null)) 
					listOfDates.add( ((Problem)each).getProblemEffectiveTime().getLow() );
				if (("High".equals(highLow) ) & (((Problem)each).getProblemEffectiveTime().getHigh() != null)) 
					listOfDates.add( ((Problem)each).getProblemEffectiveTime().getHigh() );
			}
		} else if ("SubstanceDispensationEvent".equals(each.getClass().getSimpleName()) ) {
			if (((SubstanceDispensationEvent)each).getDispensationTime() != null) {
				//listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime() );
				if (("Low".equals(highLow) ) & (((SubstanceDispensationEvent)each).getDispensationTime().getLow() != null)) 
					listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime().getLow() );
				if (("High".equals(highLow) ) & (((SubstanceDispensationEvent)each).getDispensationTime().getHigh() != null)) 
					listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime().getHigh() );
			}
		} else if ("SubstanceAdministrationEvent".equals(each.getClass().getSimpleName()) ) {
			if (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() != null) {
				//listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() );
				if (("Low".equals(highLow) ) & (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval().getLow() != null)) 
					listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval().getLow() );
				if (("High".equals(highLow) ) & (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval().getHigh() != null)) 
					listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval().getHigh() );
			}
		} else if ("ObservationResult".equals(each.getClass().getSimpleName()) ) {
			if (((ObservationResult)each).getObservationEventTime() != null) {
				//listOfDates.add( ((ObservationResult)each).getObservationEventTime() );
				if (("Low".equals(highLow) ) & (((ObservationResult)each).getObservationEventTime().getLow() != null)) 
					listOfDates.add( ((ObservationResult)each).getObservationEventTime().getLow() );
				if (("High".equals(highLow) ) & (((ObservationResult)each).getObservationEventTime().getHigh() != null)) 
					listOfDates.add( ((ObservationResult)each).getObservationEventTime().getHigh() );
			}
		} else {
			//error condition, unsupported ClinicalStatement, need to throw useful exception
			//FIXME listOfDates.add( "Unsupported vMR Class: " + each.getClass().getSimpleName() + ", unable to locate date values for id: " + ((ClinicalStatement)each).getId() );
			}
		}

		java.util.Collections.sort(listOfDates);	

		return listOfDates;
	}
	
	
//	/** getListOfDateStringsFromListOfClinicalStatements replaced by getListOfDatesAsSortedFormattedStringFromListOfClinicalStatements
//	 * @param cSList
//	 * @param highLowBoth
//	 * @return List of dates
//	 */
//	@SuppressWarnings("rawtypes")
//	public static java.util.List getListOfDateStringsFromListOfClinicalStatements(java.util.List cSList, String highLowBoth)
//	{
//		/*
//		returns list of dates, separated by spaces, of either low or high times, or both, from all supported clinicalStatements in the list
//		returns empty string if the list is empty
//		NOT: returns an error message within the list if a clinicalStatement is not supported in the list below
//		*/
//		
//			java.util.List<IVLDate> listOfDates = new java.util.ArrayList<IVLDate>();
//			
//			for (Object each : cSList) {
//				if ("EncounterEvent".equals( each.getClass().getSimpleName() ) ) {
//					if (((EncounterEvent)each).getEncounterEventTime() != null) {
//						listOfDates.add( ((EncounterEvent)each).getEncounterEventTime() );
//					}
//				} else if ("ProcedureEvent".equals(each.getClass().getSimpleName()) ) {
//					if (((ProcedureEvent)each).getProcedureTime() != null) {
//						listOfDates.add( ((ProcedureEvent)each).getProcedureTime() );
//					}
//				} else if ("Problem".equals(each.getClass().getSimpleName()) ) {
//					if (((Problem)each).getProblemEffectiveTime() != null) {
//						listOfDates.add( ((Problem)each).getProblemEffectiveTime() );
//					}
//				} else if ("SubstanceDispensationEvent".equals(each.getClass().getSimpleName()) ) {
//					if (((SubstanceDispensationEvent)each).getDispensationTime() != null) {
//						listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime() );
//					}
//				} else if ("SubstanceAdministrationEvent".equals(each.getClass().getSimpleName()) ) {
//					if (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() != null) {
//						listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() );
//					}
//				} else if ("ObservationResult".equals(each.getClass().getSimpleName()) ) {
//					if (((ObservationResult)each).getObservationEventTime() != null) {
//						listOfDates.add( ((ObservationResult)each).getObservationEventTime() );
//					}
//				} else {
//					//error condition, unsupported ClinicalStatement;
//					//listOfDates.add( "Unsupported vMR Class: " + each.getClass().getSimpleName() + ", unable to locate date values for id: " + ((ClinicalStatement)each).getId() );
//				}
//			}
//						
//			return getStandardPrintDateListFromIVLDateList(listOfDates, highLowBoth); 
//		}


	/** getListUnion
	 * @param list1Unchanged
	 * @param list2Unchanged
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static java.util.List getListUnion(java.util.List list1Unchanged, java.util.List list2Unchanged) 
	{
//	/* 
//	Returns a list with the contents of each list added.
//
//	Always returns a list, even if empty (i.e., does not return null).
//	*/
		java.util.ArrayList newList = new java.util.ArrayList();

		if (list1Unchanged != null)
		{
			newList.addAll(list1Unchanged);
		}
		if (list2Unchanged != null)
		{
			newList.addAll(list2Unchanged);
		}
		return newList;
	}	

	
	/**getPrefixedAssertionsAsString
	 * @param prefix
	 * @param assertions
	 * @return
	 */
	public static String getPrefixedAssertionsAsString(String prefix, java.util.HashSet<String> assertions) 
	{
	/*
	Input Parameters: the global HashSet assertions
	Output: a single String containing all of the members of the assertions global which meet the following conditions:
		1. The String value begins with a submitted prefix, such as "print:" or "debug:" 
			or "C12345:" (an OpenCDS Concept Code, generally representing a QM output group)

	Example initial returned result:  
	"C123:EncounterType=O|C456:DaysSupply=30|C7890:loopIndex=2|C12345:denomMet|C12345:C248"

	Example returned String if selected prefix is "C12345:":
	"denomMet|C248"
	*/

		java.util.ArrayList<String> assertionsList = new java.util.ArrayList<String>();
		for (String assrt : (HashSet<String>) assertions) {
	        	if ((assrt.length() > prefix.length()) && (prefix.equals(assrt.substring(0, prefix.length())))) {
	        		assertionsList.add(assrt.substring(prefix.length(), assrt.length() ));
			}
		}

		java.util.Collections.sort(assertionsList);
		java.lang.StringBuffer buffer = new java.lang.StringBuffer();
		
		for (int k = 0; k < assertionsList.size(); k++)
		{
			String assertion = assertionsList.get(k);
			buffer.append(assertion);
//			if (assertion.startsWith("C0") || assertion.startsWith("C1") || assertion.startsWith("C2") || assertion.startsWith("C3") || assertion.startsWith("C4") 
//				|| assertion.startsWith("C5") || assertion.startsWith("C6") || assertion.startsWith("C7") || assertion.startsWith("C8") || assertion.startsWith("C9"))
//			{
//				buffer.append("=");
//				buffer.append(getOpenCDSConceptName(assertion));
//			}
				
			if (k <	assertionsList.size() - 1)
			{
				buffer.append("|");
			}
		}

		return buffer.toString();
	}
	
	
	/** getPrefixedNamedObjectsAsString
	 * @param prefix
	 * @param namedObjects
	 * @return String containing all of the members of the namedObjects global which meet the specified conditions
	 */
	public static String getPrefixedNamedObjectsAsString(String prefix, @SuppressWarnings("rawtypes") java.util.HashMap namedObjects) 
	{
//	/*
//	Input Parameters: the global hashMap namedObjects
//	Output: a single String containing all of the members of the namedObjects global which meet the following conditions:
//		1. The name of the key begins with a submitted prefix, such as "print:" or "debug:"
//		2. The value associated with that key is a String, or can be cast to a String
//		
//	Example returned result:  "print:EncounterType=O|print:DaysSupply=30|print:loopIndex=2"
//	*/
	
		@SuppressWarnings("unchecked")
		java.util.Set<String> names = namedObjects.keySet();
		java.util.ArrayList<String> namedObjectsList = new java.util.ArrayList<String>();
		for (String name : names) {
	        if ((name.length() > prefix.length()) && (prefix.equals(name.substring(0, prefix.length())))) {
	        	Object value = namedObjects.get(name);
	        	String s = (String)value;
				namedObjectsList.add(name + "=" + s);
			}
		}
		java.util.Collections.sort(namedObjectsList);
		java.lang.StringBuffer buffer = new java.lang.StringBuffer();
		
		for (int k = 0; k < namedObjectsList.size(); k++)
		{
			String debugInfo = namedObjectsList.get(k);
			buffer.append(debugInfo);
				
			if (k <	namedObjectsList.size() - 1)
			{
				buffer.append("|");
			}
		}
	
		return buffer.toString();
	}

	
	/** getStandardPrintDateFromDate
	 * 
	 * @param thisDate
	 * @return
	 */
	public static String getStandardPrintDateFromDate(Date thisDate) {

		String dateAsString = "";
		dateAsString = getFormattedDateStringFromDate(thisDate, "null", "yyyyMMddHHmmss");
		return dateAsString;

	}
	
	
	/** getStandardPrintDateFromIVLDate
	 * 
	 * @param thisIvl
	 * @param highLowBoth
	 * @return
	 */
	public static String getStandardPrintDateFromIVLDate(IVLDate thisIvl, String highLowBoth) {

		String dateAsString = "";
		dateAsString = getFormattedDateStringFromIVLDate(thisIvl, highLowBoth, false, "", "", "", "-", "null", "yyyy-MM-dd HH:mm:ss");
		return dateAsString;

	}
	
	
	/** getStandardPrintDateListFromDateList
	 * 
	 * @param thisDate
	 * @return
	 */
	public static String getStandardPrintDateListFromDateList(java.util.List datesToFormat)
	/*
	returns formatted list of dates from all dates in the input datesToFormat list
	returns empty string if the date list is empty
	*/
	{
	String dateSeparator = ", ";		//separates the dates from one individual clinical statement, e.g., " ", ", ", etc.

		java.util.List<String> listOfDates = new java.util.ArrayList<String>();
		for (java.util.Date each : (java.util.List<java.util.Date>)datesToFormat) {
			listOfDates.add( getStandardPrintDateFromDate(each) );
		}
		
		java.util.Collections.sort(listOfDates);
			
		java.lang.StringBuffer buffer = new java.lang.StringBuffer();
		boolean firstTimeThru = true;
		String previousDate = "";
		for (String each : listOfDates) {
			if (!previousDate.equals(each)) {
				if ( firstTimeThru ) { buffer.append(each); } else {buffer.append(dateSeparator + each); }
				firstTimeThru = false;
			}
			previousDate = each;
		}
				
		return "[List<Date>]" + buffer.toString();
	}
	
	
	/** getStandardPrintDateListFromIVLDateList
	 * 
	 * @param listOfIVLDates
	 * @param highLowBoth
	 * @return
	 */
	public static String getStandardPrintDateListFromIVLDateList(java.util.List listOfIVLDates, String highLowBoth) 
{
	/*
	returns list of dates, separated by spaces, of either low or high times, or both, from all supported clinicalStatements in the list
	returns empty string if the list is empty
	does not: returns an error message within the list if a clinicalStatement is not supported in the list below
	*/

		String dateSeparator = ",";
		java.util.List<String> standardPrintListOfIVLDates = new java.util.ArrayList<String>();
		
		for (Object each : listOfIVLDates) {
			if ( each == null) {
				standardPrintListOfIVLDates.add( "getStandardPrintDateListFromIVLDateList: Null date." );
			} else if ( !"IVLDate".equals(each.getClass().getSimpleName() ) ){
				standardPrintListOfIVLDates.add( "getStandardPrintDateListFromIVLDateList: List object is not an IVLDate." );					
			} else {
				IVLDate thisIVLDate = (IVLDate)each;
				standardPrintListOfIVLDates.add(getStandardPrintDateFromIVLDate(thisIVLDate, highLowBoth));

			}
		}
			
		java.util.Collections.sort(standardPrintListOfIVLDates);
		
		java.lang.StringBuffer buffer = new java.lang.StringBuffer();
		boolean firstTimeThru = true;
		String previousDate = "";
		for (Object each : standardPrintListOfIVLDates) {
			String eachString = (String)each;
			if (!previousDate.equals(each)) {
				if ( firstTimeThru ) { buffer.append(eachString ); } else {buffer.append(dateSeparator + eachString ); }
				firstTimeThru = false;
			}
			previousDate = eachString ;
		}
			
		return "[List<Date>]" + buffer.toString();
	}		
	
	
	
	/** getStandardPrintDateListFromListOfClinicalStatements
	 * 
	 * @param thisIvl
	 * @param highLowBoth
	 * @return
	 */
	public static String getStandardPrintDateListFromListOfClinicalStatements(java.util.List<ClinicalStatement> cSList, String highLowBoth)
	{
		/*
	returns list of dates, separated by spaces, of either low or high times, or both, from all supported clinicalStatements in the list
	returns empty string if the list is empty
	returns an error message within the list if a clinicalStatement is not supported in the list below
	*/
	
		//String dateSeparator 	= ", ";		//separates the dates from one individual clinical statement, e.g., " ", ", ", etc.
		java.util.List<IVLDate> listOfDates = new java.util.ArrayList<IVLDate>();
		
		for (Object each : cSList) {
			if ("EncounterEvent".equals( each.getClass().getSimpleName() ) ) {
				if (((EncounterEvent)each).getEncounterEventTime() != null) {
					listOfDates.add( ((EncounterEvent)each).getEncounterEventTime() );
				}
			} else if ("ProcedureEvent".equals(each.getClass().getSimpleName()) ) {
				if (((ProcedureEvent)each).getProcedureTime() != null) {
					listOfDates.add( ((ProcedureEvent)each).getProcedureTime() );
				}
			} else if ("Problem".equals(each.getClass().getSimpleName()) ) {
				if (((Problem)each).getProblemEffectiveTime() != null) {
					listOfDates.add( ((Problem)each).getProblemEffectiveTime() );
				}
			} else if ("SubstanceDispensationEvent".equals(each.getClass().getSimpleName()) ) {
				if (((SubstanceDispensationEvent)each).getDispensationTime() != null) {
					listOfDates.add( ((SubstanceDispensationEvent)each).getDispensationTime() );
				}
			} else if ("SubstanceAdministrationEvent".equals(each.getClass().getSimpleName()) ) {
				if (((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() != null) {
					listOfDates.add( ((SubstanceAdministrationEvent)each).getAdministrationTimeInterval() );
				}
			} else if ("ObservationResult".equals(each.getClass().getSimpleName()) ) {
				if (((ObservationResult)each).getObservationEventTime() != null) {
					listOfDates.add( ((ObservationResult)each).getObservationEventTime() );
				}
			} else {
				//error condition, unsupported ClinicalStatement;
				//listOfDates.add( "Unsupported vMR Class: " + each.getClass().getSimpleName() + ", unable to locate date values for id: " + ((ClinicalStatement)each).getId() );
			}
		}
			
		return "[List<Date>]" + getStandardPrintDateListFromIVLDateList(listOfDates, highLowBoth); 
	}	
	
	
	/** getStandardPrintDateListFromListOfDates
	 * 
	 * @param datesToFormat
	 * @return
	 */
	public static String getStandardPrintDateListFromListOfDates(java.util.List<Date> datesToFormat)
	/*
	returns formatted list of dates from all dates in the input datesToFormat list
	returns empty string if the date list is empty
	*/
	{

			return "[List<Date>]" + getStandardPrintDateListFromDateList(datesToFormat);
	}
	
	
	
	/** getStandardPrintDateListFromListOfClinicalStatements
	 * 
	 * @param cSList
	 * @param highLowBoth
	 * @param formatString
	 * @return
	 */
	public static String getStandardPrintDateListFromNamedListOfDates(java.util.List<java.util.Date> datesToFormat)
	{
		/*
		returns formatted list of dates from all dates in the input datesToFormat list
		returns empty string if the date list is empty
		*/

			String dateSeparator = ",";		//separates the dates from one individual clinical statement, e.g., " ", ", ", etc.

			java.util.List<String> listOfDates = new java.util.ArrayList<String>();
			for (java.util.Date each : (java.util.List<java.util.Date>)datesToFormat) {
				listOfDates.add( getStandardPrintDateFromDate(each) );
			}
			
			java.util.Collections.sort(listOfDates);
				
			java.lang.StringBuffer buffer = new java.lang.StringBuffer();
			boolean firstTimeThru = true;
			String previousDate = "";
			for (String each : listOfDates) {
				if (!previousDate.equals(each)) {
					if ( firstTimeThru ) { buffer.append(each); } else {buffer.append(dateSeparator + each); }
					firstTimeThru = false;
				}
				previousDate = each;
			}
					
			return "[List<Date>]" + buffer.toString();
		}
	
	
	
	/** getTimeInterval
	 * @param lowDate
	 * @param highDate
	 * @return
	 */
	public static IVLDate getTimeInterval(Date lowDate, Date highDate) 
	{
//	/* 
//	Returns IVLDate with specified parameters.
//	*/
		IVLDate ivlDate = new IVLDate();
		ivlDate.setLow(lowDate);
		ivlDate.setHigh(highDate);
		return ivlDate;
	}	
	
	
	/** getTimeNames
	 * @param timeEnumeration
	 * @return
	 */
	public static String getTimeNames(String timeEnumeration)
	{

	    HashMap<String, String> openCdsTimeEnumToName = new HashMap<String, String>();
	    openCdsTimeEnumToName.put("1", "Year(s)");
	    openCdsTimeEnumToName.put("2", "Month(s)");
	    openCdsTimeEnumToName.put("3", "Week(s)");
	    openCdsTimeEnumToName.put("5", "Day(s)");
	    openCdsTimeEnumToName.put("11", "Hour(s)");
	    openCdsTimeEnumToName.put("12", "Minute(s)");
	    openCdsTimeEnumToName.put("13", "Second(s)");

	    String name = openCdsTimeEnumToName.get(timeEnumeration);
	    if (name == null) { name = timeEnumeration; }
	    return name;   
	}

	
//	RETIRED
//	/** identifyDifferentEncounterHighLowDates
//	 * @param namedObjectKeyForEncounterDateMap
//	 * @param highLow
//	 * @param encounterEventList
//	 * @param namedObjects
//	 * @return
//	 */
//	boolean identifyDifferentEncounterHighLowDates (String namedObjectKeyForEncounterDateMap, String highLow, List encounterEventList, HashMap namedObjects) 
////	/*
////	 * Inputs:
////	 * namedObjectKeyForEncounterDateMap: the key to namedObjects which contains the encounterDateMap.  
////	 * The encounterDateMap is a map where the key is date string, format yyyyMMdd, representing the encounter low date,
////	 *      and the value is the IVLDate that represents the low and high values of the encounterEventTime.  If there are
////	 *      multiple encounters with the same low date, the one with the latest high value will be included.
////	 *      --> Note that there may be IVLDates with different start dates, that still overlap due to the end dates. 
////	 * encounterEventList: list of EncounterEvents of interest.  May be null.
////	 * namedObjects: global namedObjects.  Must not be null.     
////	 *      
////	 * It is up to the process that uses this list to determine whether the starting and ending times of entries overlap.
////	 * 
////	 * The function always returns a value of true.
////	 */
//	{
//		Map<String, IVLDate> allEncounterDatesMap = null;
//		
//		if (namedObjects.get(namedObjectKeyForEncounterDateMap) == null) {
//			/* doesn't exist, so create it */
//			allEncounterDatesMap = new HashMap<String, IVLDate>();
//			
//		} else {
//			/* does exist, so get it... */
//			allEncounterDatesMap = (Map<String, IVLDate>)namedObjects.get(namedObjectKeyForEncounterDateMap);
//		}
//
//		/* loop through the encounter list, and ensure that each encounter date is present in the encounterDateMap */
//		if ((encounterEventList != null) && (encounterEventList.size() > 0))
//		{
//			//System.out.println("IDESD: encounterEventList.size()=" + encounterEventList.size());
//			for (EncounterEvent enc : (List<EncounterEvent>) encounterEventList) {
//				if (enc.getEncounterEventTime() != null) 
//				{
//					IVLDate encounterEventTime = enc.getEncounterEventTime();
//					
//					/*  create a date string */
//					String date = "";
//
//					if (("High".equals(highLow)) && (encounterEventTime.getHigh() != null))
//					{
//						date = org.opencds.common.utilities.DateUtility.getInstance().getDateAsString(encounterEventTime.getHigh(), "yyyyMMdd");
//					}
//					else if (("Low".equals(highLow)) && (encounterEventTime.getLow() != null))
//					{
//						date = org.opencds.common.utilities.DateUtility.getInstance().getDateAsString(encounterEventTime.getLow(), "yyyyMMdd");
//					}
//					else 
//					{
//						//System.out.println("IDESD: input encList date is null" );	
//						continue;	//skip this encounter because it has no usable encounterEventTime
//					}
//					
//					//System.out.println("IDESD: input encList date = " + date);		
//
//					/* use it for the key into the HashMap */
//					IVLDate existingEncTime = (IVLDate)allEncounterDatesMap.get(date);
//					
//					/* update only if the new encounter has a high value that is after the existing encounter time high value
//					 * or the existingEncTime is null
//					 */
//					if ( existingEncTime == null)  
//					{
//						allEncounterDatesMap.put(date, encounterEventTime);
//						//System.out.println("IDESD: put new date = " + date);		
//					}
//					else if ( existingEncTime.getHigh().before( encounterEventTime.getHigh() ) ) 
//					{
//						//System.out.println("IDESD: get date = " + date + ", finds: low = " 
//						//	+ org.opencds.common.utilities.DateUtility.getInstance().getDateAsString(existingEncTime.getLow(), "yyyyMMdd")
//						//	+ ", high = " + org.opencds.common.utilities.DateUtility.getInstance().getDateAsString(existingEncTime.getHigh(), "yyyyMMdd") );		
//						allEncounterDatesMap.put(date, encounterEventTime);
//						//System.out.println("IDESD: replace date = " + date);		
//					}
//				}
//			}
//
//			/* create the map entry if it is NOT null... */
//			namedObjects.put(namedObjectKeyForEncounterDateMap, allEncounterDatesMap);
//		}
//		else
//		{
//			//System.out.println("IDESD: encounterEventList is null for: " + namedObjectKeyForEncounterDateMap);
//		}
//
//		
//		return true;
//	}
	
	
    /** numberOfVisitsFromGestationalAgeDefinedByHedisFPC
     * @param gestAge
     * @return
     */
	public static int numberOfVisitsFromGestationalAgeDefinedByHedisFPC (int gestAge) 
//	/*
//	ACOG recommends that women with an uncomplicated pregnancy receive visits every 
//	4 weeks for the first 28 weeks of pregnancy, every 2�3 weeks until 36 weeks of pregnancy, and weekly thereafter. 
//	*/
    {
    	double numberOfVisits = 0;
	double gestationalAge = gestAge;
		if (gestationalAge <= 29) 
				{numberOfVisits = (gestationalAge/4) - 1;}
		else if (gestationalAge < 36) 
				{numberOfVisits = (7 + ((gestationalAge-29)/2.5));}
		else if (36 <= gestationalAge)
				{numberOfVisits = (gestationalAge-26);}
        
		
	return (int)numberOfVisits;
    }
	
	
    /** pqMeetsReq
     * @param pq
     * @param operator
     * @param pqTargetValue
     * @param pqTargetUnits
     * @return
     */
	public static boolean pqMeetsReq(PQ pq, String operator, double pqTargetValue, String pqTargetUnits)  
//	/*
//	Returns true if [pq] [operator] [pqTargetValue] is true and pqTargetUnits is the units of pq 
//	Inputs required:
//	pq = the PQ
//	operator - contains comparator to PQ value (LT, LE, EQ, GE, GT, NE)
//	pqTargetValue - contains the target decimal value 
//	pqTargetUnits - contains target physical quantity units	
//	*/
	{
		if ( pq != null)
		{
			if (pqTargetUnits.equals(pq.getUnit()))
			{
				if (operator == "<=")
				{
					if (pq.getValue() <= pqTargetValue) 
					{
						return true;
					}					
				}
				else if (operator == "<")
				{
					if (pq.getValue() < pqTargetValue) 
					{
						return true;
					}
				}
				else if (operator == "==")
				{
					if (pq.getValue() == pqTargetValue) 
					{
						return true;
					}
				}
				else if (operator == ">")
				{
					if (pq.getValue() > pqTargetValue) 
					{
						return true;						
					}
				}
				else if (operator == ">=")
				{
					if (pq.getValue() >= pqTargetValue) 
					{
						return true;
					}
				}
				else if (operator == "!=")
				{
					if (pq.getValue() != pqTargetValue) 
					{
						return true;
					}
				}
			}
		}
		return false;					
	}
    
    
    /** printMessageToScreen
     * @param message
     * @return
     */
	public static boolean printMessageToScreen(String message) 
//    /* debug function that returns true and prints message to screen */
    {
    	System.out.println("DEBUG - printMessageToScreen: " + message);
    	
    	return true;
    }
    
    
    /** printObjectToScreen
     * @param objectLabel
     * @param object
     * @return
     */
	public static boolean printObjectToScreen(String objectLabel, Object object) 
//    /* debug function that returns true and prints object to screen */
    {
    	if (object != null)
    	{
    		System.out.println(">> DEBUG - Contents of " + objectLabel + ": <" + object.toString() + ">");
    	}
    	else
    	{
    		System.out.println(">> DEBUG - Contents of " + objectLabel + ": <null>");
    	}
    	return true;
    }
    
    
    /** proceduresOrObservationsMeetAgeReqAndAdjacent
     * @param dob
     * @param evalTime
     * @param minAgeInYrs
     * @param maxSeparation
     * @param maxSeparationTimeUnits
     * @param proc1List
     * @param obs1List
     * @param proc2List
     * @param obs2List
     * @param highLow
     * @return true if input parameters meet requirements
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static boolean proceduresOrObservationsMeetAgeReqAndAdjacent(
    		java.util.Date dob, 
    		java.util.Date evalTime, 
    		int minAgeInYrs, 
    		long maxSeparation, 
    		int maxSeparationTimeUnits, 
    		List proc1List, 
    		List obs1List, 
    		List proc2List, 
    		List obs2List, 
    		String highLow) 
//    /*
//    Returns true if there is a procedure in proc1List OR an observation in obs1List where the patient was at least the minimum age specified, as well as a procedure in proc2List OR an observation in obs2List where the patient was at least the minimum age specified, in which there is at least one pairing between the two groups that had the maximum time separation specified.
//    Inputs required:
//    dob - patient's date of birth
//    evalTime - evaluation time
//    minAgeInYrs - minimum age patient had to be for a procedure or observation to be counted
//    maxSeparation, maxSeparationUnits - maximum separation allowed from the proc1/obs1 list entries and the proc2/obs2 list entries.  E.g., 4 days means entries must be 4 or less days apart.  Units must be in Java Calendar time.  Note that Weeks are not currently supported.
//    proc1List - contains ProcedureEvents of type 1 
//    obs1List - contains ObservationResults of type 1
//    proc2List - contains ProcedureEvents of type 2
//    obs2List - contains ObservationResults of type 2
//    highLow - "High" or "Low" to indicate which part of the times should be used
//
//    Approach:
//    - Create a list of dates for types 1 and 2 in which patient was at least minAge at lowTime
//    - Go through every entry in list of dates for type 1, check against every entry in list of dates for type 2
//    - Return true if there are entries within the maxSeparation, return false otherwise
//    */
    {
//    /* System.out.println();
//    System.out.println(">Type 1 Procs: " + proc1List.size());
//    System.out.println(">Type 2 Procs: " + proc2List.size());
//    System.out.println(">Type 1 Obs: " + obs1List.size());
//    System.out.println(">Type 2 Obs: " + obs2List.size());
//    System.out.println();
//    */
    	org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
    	
    	// Create a list of dates for types 1 and 2 in which patient was at least minAge at lowTime
    	ArrayList<java.util.Date> type1Dates = new ArrayList<java.util.Date>();
    	ArrayList<java.util.Date> type2Dates = new ArrayList<java.util.Date>();
    	
    	for (ProcedureEvent proc : ((List<ProcedureEvent>) proc1List))
    	{
    		java.util.Date procDate; 
    		if ((highLow != null) && (highLow.equals("High")))
    		{
    			procDate = proc.getProcedureTime().getHigh();
    		}
    		else
    		{
    			procDate = proc.getProcedureTime().getLow();
    		}

    		if (dateUtility.getAgeAtSpecifiedTime(dob, procDate) >= minAgeInYrs)
    		{
    			type1Dates.add(procDate);
    		}
    	}
    	
    	for (ProcedureEvent proc : ((List<ProcedureEvent>) proc2List))
    	{
    		
    		java.util.Date procDate; 
    		if ((highLow != null) && (highLow.equals("High")))
    		{
    			procDate = proc.getProcedureTime().getHigh();
    		}
    		else
    		{
    			procDate = proc.getProcedureTime().getLow();
    		}
    		
    		if (dateUtility.getAgeAtSpecifiedTime(dob, procDate) >= minAgeInYrs)
    		{
    			type2Dates.add(procDate);
    		}
    	}
    	
    	for (ObservationResult obs : ((List<ObservationResult>) obs1List))
    	{		
    		java.util.Date obsDate; 
    		if ((highLow != null) && (highLow.equals("High")))
    		{
    			obsDate = obs.getObservationEventTime().getHigh();
    		}
    		else
    		{
    			obsDate = obs.getObservationEventTime().getLow();
    		}

    		if (dateUtility.getAgeAtSpecifiedTime(dob, obsDate) >= minAgeInYrs)
    		{
    			type1Dates.add(obsDate);
    		}
    	}
    	
    	for (ObservationResult obs : ((List<ObservationResult>) obs2List))
    	{		
    		java.util.Date obsDate; 
    		if ((highLow != null) && (highLow.equals("High")))
    		{
    			obsDate = obs.getObservationEventTime().getHigh();
    		}
    		else
    		{
    			obsDate = obs.getObservationEventTime().getLow();
    		}

    		if (dateUtility.getAgeAtSpecifiedTime(dob, obsDate) >= minAgeInYrs)
    		{
    			type2Dates.add(obsDate);
    		}
    	}
    	
    	// - Go through every entry in list of dates for type 1, check against every entry in list of dates for type 2
    	// - Return true if there are entries within the maxSeparation, return false otherwise
    	
    	java.util.Collections.sort(type1Dates);
    	java.util.Collections.sort(type2Dates);
    	
    	for (java.util.Date type1Date : type1Dates)
    	{
    		for (java.util.Date type2Date : type2Dates)
    		{
    			//System.out.println();
    			//System.out.println("Type 1 date: " + type1Date);
    			//System.out.println("Type 2 date: " + type2Date);
    			//System.out.println();

    			if(dateUtility.timeDifferenceLessThanOrEqualTo(type1Date, type2Date, maxSeparationTimeUnits, maxSeparation))
    			{
    				//System.out.println();
    				//System.out.println("Time difference less than or equal");
    				//System.out.println();

    				return true;
    			}
    		}
    	}

    	return false;
    }
    
    
    /** proceduresOrObservationsMeetDateValueReq
     * @param procList
     * @param procDVList1
     * @param procDVList2
     * @param obsList
     * @param obsMeetingAllButValReq1List
     * @param obsMeetingAllButValReq2List
     * @param dateOperator
     * @param obsOperator1
     * @param obsPQn1
     * @param obsPQunits1
     * @param obsOperator2
     * @param obsPQn2
     * @param obsPQunits2
     * @param highLow
     * @return
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static boolean proceduresOrObservationsMeetDateValueReq(
			List procList,
			List procDVList1, 
			List procDVList2, 
			List obsList,
			List obsMeetingAllButValReq1List, 
			List obsMeetingAllButValReq2List,
			String dateOperator, 
			String obsOperator1, 
			double obsPQn1,
			String obsPQunits1, 
			String obsOperator2, 
			double obsPQn2,
			String obsPQunits2, 
			String highLow)
//	/*
//		Returns true if the following evaluates to true. Note that this was designed specifically for HEDIS 2014 CDC (Diabetes) BP quality measure evaluation. All time components are to be ignored. 
//		
//	 1. Return false if both procList and obsList are empty 
//	 2. Starting with procList and obsList, identify the earliest or latest date-time (as determined by dateOperator) 
//	 3. Option 1 for meeting criteria: 
//	 - Both procDVList1 and procDVList2 contain an entry on the same day as the anchor date 
//	 4. Option 2 for meeting criteria: 
//	 - Both obsMeetingAllButValReqList1 and obsMeetingAllButValReqList2 contain an entry on the same day as the anchor date which meets the PQ value requirement
//	 
//	 Inputs required: 
//	 procList - contains ProcedureEvents 
//	 obsList - contains ObservationResults 
//	 procDVList - contains ProcedureEvents of desired result 
//	 obsDVList - contains ObservationResults of desired result
//	 dateOperator - contains comparator between times (LT or GT) - LT = earliest, GT = latest 
//	 obsOperator - contains comparator to PQ value (LT, LE, EQ, GE, GT, NE) 
//	 obsPQn - contains physical quantity decimal value
//	 obsPQunits - contains physical quantity units 
//	 highLow - "High" or "Low" to indicate which part of the event times should be used
//	 */
	{
		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();

		// 1. Return false if both procList and obsList are empty
		if (((procList == null) || (procList.size() == 0)) && ((obsList == null) || (obsList.size() == 0))) 
		{
			return false;
		}

		// 2. Starting with procList and obsList, identify the earliest or
		// latest date-time (as determined by dateOperator)
		java.util.Date anchorDate = null;

		if (procList != null) 
		{
			for (ProcedureEvent proc : (List<ProcedureEvent>) procList) 
			{
				java.util.Date procDate = ((highLow != null) && (highLow.equals("High"))) ? proc.getProcedureTime().getHigh() : proc.getProcedureTime().getLow();
				
				if (anchorDate == null) 
				{
					anchorDate = procDate;
				} 
				else 
				{
					if ((dateOperator != null) && (dateOperator.equals("<"))) // earliest
					{
						if (procDate.before(anchorDate)) 
						{
							anchorDate = procDate;
						}
					} 
					else if ((dateOperator != null) && (dateOperator.equals(">"))) // latest
					{
						if (procDate.after(anchorDate)) 
						{
							anchorDate = procDate;
						}
					}
				}
			}
		}

		if (obsList != null)
		{
			for (ObservationResult obs : (List<ObservationResult>) obsList) 
			{
				java.util.Date obsDate = ((highLow != null) && (highLow.equals("High"))) ? obs.getObservationEventTime().getHigh() : obs.getObservationEventTime().getLow();
				
				if (anchorDate == null) 
				{
					anchorDate = obsDate;
				} 
				else 
				{
					if ((dateOperator != null) && (dateOperator.equals("<"))) // earliest
					{
						if (obsDate.before(anchorDate)) 
						{
							anchorDate = obsDate;
						}
					} 
					else if ((dateOperator != null) && (dateOperator.equals(">"))) // latest
					{
						if (obsDate.after(anchorDate)) 
						{
							anchorDate = obsDate;
						}
					}
				}
			}
		}

		// return false if anchor date not found
		if (anchorDate == null) 
		{
			return false;
		}

		// 3. Option 1 for meeting criteria:
		// - Both procDVList1 and procDVList2 contain an entry on the same day
		// as the anchor date

		boolean procDVList1CriteriaMet = false;
		boolean procDVList2CriteriaMet = false;

		if (procDVList1 != null) 
		{
			for (ProcedureEvent proc : (List<ProcedureEvent>) procDVList1) 
			{
				java.util.Date procDate = ((highLow != null) && (highLow.equals("High"))) ? proc.getProcedureTime().getHigh() : proc.getProcedureTime().getLow();
				
				if (dateUtility.isSameDay(anchorDate, procDate)) 
				{
					procDVList1CriteriaMet = true;
				}
			}
		}

		if (procDVList2 != null) 
		{
			for (ProcedureEvent proc : (List<ProcedureEvent>) procDVList2) 
			{
				java.util.Date procDate = ((highLow != null) && (highLow.equals("High"))) ? proc.getProcedureTime().getHigh() : proc.getProcedureTime().getLow();
				
				if (dateUtility.isSameDay(anchorDate, procDate)) 
				{
					procDVList2CriteriaMet = true;
				}
			}
		}

		if (procDVList1CriteriaMet && procDVList2CriteriaMet) 
		{
			return true;
		}

		// 4. Option 2 for meeting criteria:
		// - Both obsMeetingAllButValReqList1 and obsMeetingAllButValReqList2
		// contain an entry on the same day as the anchor date which meets the
		// PQ value requirement

		boolean obs1CriteriaMet = false;
		boolean obs2CriteriaMet = false;

		if (obsMeetingAllButValReq1List != null) 
		{
			for (ObservationResult obs : (List<ObservationResult>) obsMeetingAllButValReq1List) 
			{
				if (obs.getObservationEventTime() != null)
				{
					java.util.Date obsDate = ((highLow != null) && (highLow.equals("High"))) ? obs.getObservationEventTime().getHigh() : 	obs.getObservationEventTime().getLow();
				
					if (dateUtility.isSameDay(anchorDate, obsDate)) 
					{
						ObservationValue obsValue = obs.getObservationValue();
						if (obsValue != null) 
						{
							if (pqMeetsReq(obsValue.getPhysicalQuantity(), obsOperator1, obsPQn1, obsPQunits1))
							{
								obs1CriteriaMet = true;
							}
						}
					}
				}
			}
		}
		
		if (obsMeetingAllButValReq2List != null) 
		{
			for (ObservationResult obs : (List<ObservationResult>) obsMeetingAllButValReq2List) 
			{
				if (obs.getObservationEventTime() != null)
				{
					java.util.Date obsDate = ((highLow != null) && (highLow.equals("High"))) ? obs.getObservationEventTime().getHigh() : 	obs.getObservationEventTime().getLow();
				
					if (dateUtility.isSameDay(anchorDate, obsDate)) 
					{
						ObservationValue obsValue = obs.getObservationValue();
						if (obsValue != null) 
						{
							if (pqMeetsReq(obsValue.getPhysicalQuantity(), obsOperator2, obsPQn2, obsPQunits2))
							{
								obs2CriteriaMet = true;
							}
						}
					}
				}
			}
		}
		
		if (obs1CriteriaMet && obs2CriteriaMet) 
		{
			return true;
		}
		
		return false;		
	}
    
    
    /** proceduresOrObservationsMeetTimeReq
     * @param dob
     * @param evalTime
     * @param proc1List
     * @param obs1List
     * @param highLow
     * @return
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static boolean proceduresOrObservationsMeetTimeReq(java.util.Date dob, java.util.Date evalTime, List proc1List, List obs1List, String highLow) 
    /*
//    Returns true if there is a procedure in proc1List OR an observation in obs1List where the event time happened no earlier than the specified time and before the evalTime.
//    Inputs required:
//    dob - patient's date of birth
//    evalTime - evaluation time
//    proc1List - contains ProcedureEvents of type 1 
//    obs1List - contains ObservationResults of type 1
//    highLow - "High" or "Low" to indicate which part of the times should be used
//
//    Approach:
//    - Create a list of dates for types 1 
//    - Return true if there is at least one entry in at least one of the lists, return false otherwise
//    */
    {
//    /* System.out.println();
//    System.out.println(">Type 1 Procs: " + proc1List.size());
//    System.out.println(">Type 1 Obs: " + obs1List.size());
//    System.out.println();
//    */
//    	org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
    	
    	// Create a list of dates for types 1 and 2 
    	ArrayList<java.util.Date> allDates = new ArrayList<java.util.Date>();
    	
    	for (ProcedureEvent proc : ((List<ProcedureEvent>) proc1List))
    	{
    		java.util.Date procDate; 
    		if ((highLow != null) && (highLow.equals("High")))
    		{
    			procDate = proc.getProcedureTime().getHigh();
    		}
    		else
    		{
    			procDate = proc.getProcedureTime().getLow();
    		}

    		allDates.add(procDate);
    	}
    	
    	for (ObservationResult obs : ((List<ObservationResult>) obs1List))
    	{		
    		java.util.Date obsDate; 
    		if ((highLow != null) && (highLow.equals("High")))
    		{
    			obsDate = obs.getObservationEventTime().getHigh();
    		}
    		else
    		{
    			obsDate = obs.getObservationEventTime().getLow();
    		}

    		allDates.add(obsDate);
    	}
    	
    	return (allDates.size() > 0); 
    }
    
    
    /** proceduresOrObservationsMeetTimeValueReq
     * @param procList
     * @param procDVList
     * @param obsList
     * @param obsDVList
     * @param dateOperator
     * @param obsOperator
     * @param obsPQn
     * @param obsPQunits
     * @param highLow
     * @return
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static boolean proceduresOrObservationsMeetTimeValueReq(List procList, List procDVList, List obsList, List obsDVList, String dateOperator, String obsOperator, double obsPQn, String obsPQunits, String highLow)  
//	/*
//	Returns true if the following is true:
//		Get the earliest or latest date in which there is a proc in procList or obs in obsList.
//		One of the following is true:
//			procDVList has an entry with the specified date
//			obsDVList has an entry with the specified date
//			obsList has an entry that meets the numeric comparison requirements with the specified date
//		
//	if there is a Procedure with the indicated desired value (second DSL parameter) 
//	or if there is an Observation Result with the indicated desired result as a coded value (second DSL parameter) 
//	or there is an Observation Result with the indicated desired Physical Quantity value.	
//
//	Inputs required:
//	procList - contains ProcedureEvents 
//	obsList - contains ObservationResults 
//	procDVList - contains ProcedureEvents of desired result
//	obsDVList - contains ObservationResults from obsList with desired coded value result
//	dateOperator - "<" for earliest, ">" for latest
//	obsOperator - contains comparator to PQ value (LT, LE, EQ, GE, GT, NE)
//	obsPQn - contains physical quantity decimal value 
//	obsPQunits - contains physical quantity units
//	highLow - "High" or "Low" to indicate which part of the event times should be used
//
//	*/
	{
//		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();

		java.util.Date earliestDate = null;
		java.util.Date latestDate = null;
		java.util.Date targetDate = null;
		
		if (procList != null)
		{
			for (ProcedureEvent proc : (List<ProcedureEvent>) procList)
			{
				java.util.Date  procDate = ((highLow != null) && (highLow.equals("High"))) ? proc.getProcedureTime().getHigh() : proc.getProcedureTime().getLow();
				if (procDate != null)
				{
					if ((earliestDate == null) || (procDate.before(earliestDate)))
					{
						earliestDate = procDate;						
					}
					if ((latestDate == null) || (procDate.after(latestDate)))
					{
						latestDate = procDate;						
					}
				}
			}
		}
		
		if (obsList != null)
		{
			for (ObservationResult obs : (List<ObservationResult>) obsList)
			{
				java.util.Date  obsDate = ((highLow != null) && (highLow.equals("High"))) ? obs.getObservationEventTime().getHigh() : obs.getObservationEventTime().getLow();
				if (obsDate != null)
				{
					if ((earliestDate == null) || (obsDate.before(earliestDate)))
					{
						earliestDate = obsDate;						
					}
					if ((latestDate == null) || (obsDate.after(latestDate)))
					{
						latestDate = obsDate;						
					}
				}
			}
		}
		
		if (dateOperator.equals("<")) // earliest
		{
			targetDate = earliestDate;
		}
		else if (dateOperator.equals(">")) // latest
		{
			targetDate = latestDate;
		}
		else
		{
			System.err.println(">>> Error in proceduresOrObservationsMeetTimeValueReq.  dateOperator of " + dateOperator + " not expected.  Using latest.");
			targetDate = latestDate;
		}
		
		if (targetDate == null)
		{
			return false;
		}
		
		// check to see if there is a match for the desired procedure at the target time
		if (procDVList != null)
		{
			for (ProcedureEvent proc : (List<ProcedureEvent>) procDVList)
			{
				java.util.Date  procDate = ((highLow != null) && (highLow.equals("High"))) ? proc.getProcedureTime().getHigh() : proc.getProcedureTime().getLow();
				if ((procDate != null) && (procDate.equals(targetDate)))
				{
					return true;
				}
			}
		}

		// check to see if there is a match for the observation result with the desired coded value at the target tiem
		if (obsDVList != null)
		{
			for (ObservationResult obs : (List<ObservationResult>) obsDVList)
			{
				java.util.Date  obsDate = ((highLow != null) && (highLow.equals("High"))) ? obs.getObservationEventTime().getHigh() : obs.getObservationEventTime().getLow();
				if ((obsDate != null) && (obsDate.equals(targetDate)))
				{
					return true;
				}
			}
		}
		
		// check to see if there is a match for an entry in observation list with the desired numeric value at the target time
		if (obsList != null)
		{
			for (ObservationResult obs : (List<ObservationResult>) obsList)
			{
				java.util.Date  obsDate = ((highLow != null) && (highLow.equals("High"))) ? obs.getObservationEventTime().getHigh() : obs.getObservationEventTime().getLow();

				 if ((obsDate != null) && (obsDate.equals(targetDate)))
				{
					if ( obs.getObservationValue() != null)
					{
						if (pqMeetsReq(obs.getObservationValue().getPhysicalQuantity(), obsOperator, obsPQn, obsPQunits))						
						{
							return true;
						}
					}
				} 
			}
		}
		return false;		
	}
    
    
    /** stripTimeComponent
	 * @param dateTime
	 * @return
	 */
    public static java.util.Date stripTimeComponent (java.util.Date dateTime)
	{
//	/* 
//
//	Returns a new java.util.Date which contains only the year month day components of the submitted java.util.Date,
//	and sets the hours, minutes, seconds and milliseconds components to 0, which makes it reference midnight of that date.  
//	Returns null if sent in null.
//
//	*/
		if (dateTime == null)
		{
			return null;
		}

		org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();
		String dateAsString = dateUtility.getDateAsString(dateTime, "yyyy-MM-dd");
		return dateUtility.getDateFromString(dateAsString, "yyyy-MM-dd");
	}
	
	
    /** systemOutPrintln
     * @param textToDisplay
     * @return
     */
    public static boolean systemOutPrintln(String textToDisplay) {
    	
    	java.text.SimpleDateFormat dateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss,SSS");
    	Date date = new Date();
    	System.out.println(dateFormat.format(date) + " " + textToDisplay ); 
    	return true;
    }
    
    
    /** timeAtOrBeforeByAtMost_ListEvaluation
     * Evaluates whether there is at least one entry where time from list 1 is at or before time from list 2.  
     * Uses the DateUtility's timeDifferenceLessThanOrEqualTo function for determining proximity, which means that hours, minutes, and seconds are ignored if the timeUnits selected is days or above.
     * Time1 must be <= Time2 when accounting for hours, minutes, and seconds.
     * Time1 + interval must be <= Time2.  Here, hours, minutes and seconds are ignored if  time interval is days, months, or years.
     * E.g., if date difference of 7 days specified, will return true if there is any entry in timeList1 which is (1) same time as any entry in timeList2, or (2) any entry in timeList2 occurred any time on the 7th day following time1 (e.g., if time1 was 1/1/2012, any time on 1/1/2012-1/8/2012 for time2 would result in a true evaluation)
     * 
     * @param timeList1 
     * @param timeList2
     * @param maxAmountTime1BeforeTime2
     * @param timeUnits must be in Calendar enumeration times.  Currently does not support "Weeks".
     * @return
     */
    @SuppressWarnings({ })
    public static boolean timeAtOrBeforeByAtMost_ListEvaluation(List<Date> timeList1, List<Date> timeList2, int maxAmountTime1BeforeTime2, int timeUnits) 
    {
    	org.opencds.common.utilities.DateUtility dateUtility = org.opencds.common.utilities.DateUtility.getInstance();

    	if ((timeList1 != null)  && (timeList2 != null))
    	{
    		for (java.util.Date time1 :  timeList1)
    		{
    			for (java.util.Date time2 :  timeList2)
    			{
    				if (time1.equals(time2))
    				{
    					return true;
    				}
    				else
    				{
    					if (time1.before(time2))
    					{
    						if (dateUtility.timeDifferenceLessThanOrEqualTo(time1, time2, timeUnits, maxAmountTime1BeforeTime2))
    						{
    							return true;
    						}
    					}
    				}
    			}
    		}
    	}
    	return false;		
    }	
    
    
    /** timeBeforeByAtLeast
     * @param time1
     * @param time2
     * @param minAmountTime1BeforeTime2
     * @param timeUnits
     * @param namedObjects
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static boolean timeBeforeByAtLeast(java.util.Date time1, java.util.Date time2, int minAmountTime1BeforeTime2, int timeUnits, java.util.HashMap namedObjects) 
    {
//    /* 
//    Pre-conditions: 
//    - timeUnits must be in Calendar enumeration times.  Currently does not support "Weeks". 
//    - namedObjects is the global OpenCDS namedObjects.  If it is desired that a "clinical" definition of time is to be used (see below for description), there MUST be a String key of "useClinicalTimeDefinition" and a target Boolean of true.  Otherwise, a "precise" definition of time is used.
//
//    Evaluates whether time1 is before time2 by at least the specified interval. 
//
//    When using the "precise"/default definition, time-of-day is never altered.  Returns true if time1 <= time2 - interval.  E.g., if interval is 1 year and time2 is March 15, 2014 at 3pm, time1 must be < March 15, 2014 at 3pm, and time1 must be <= March 15, 2013 at 3pm. 
//
//    When using the "clinical"/conventional definition, hours and smaller units are ignored for the minimum time if the calendar unit is days or greater.  E.g., if interval is 1 year and time2 is March 15, 2014 at 3pm, time1 must be <= any time on March 15, 2013. 
//    */
    	boolean useClinicalTimeDefinition = false;
    	if (namedObjects != null)
    	{
    		Boolean useClinicalTimeDefinitionBoolean = null;
    		Object useClinicalTimeDefinitionObject = namedObjects.get("useClinicalTimeDefinition");
    		
    		if (useClinicalTimeDefinitionObject != null)
    		{
    			useClinicalTimeDefinition = true;
    				
    			try
    			{
    				useClinicalTimeDefinitionBoolean = (Boolean) useClinicalTimeDefinitionObject;
    			}
    			catch (Exception e)
    			{
    			}
    			if (useClinicalTimeDefinitionBoolean != null)
    			{
    				useClinicalTimeDefinition = useClinicalTimeDefinitionBoolean.booleanValue();
    			}
    		}

    	}

    	if (useClinicalTimeDefinition)
    	{
    		if ((time1 != null) && (time2 != null))
    		{
    			if (time1.before(time2))
    			{		
    		if(! org.opencds.common.utilities.DateUtility.getInstance().timeDifferenceLessThan(time1, time2, timeUnits, minAmountTime1BeforeTime2))
    				{
    					return true;
    				}
    			}
    		}
    		return false;
    	}
    	else
    	{
    		if ((time1 != null) && (time2 != null))
    		{
    			if (time1.before(time2))
    			{
    				java.util.Date time2MinusInterval = org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(time2, timeUnits, -1 * minAmountTime1BeforeTime2);

    				if (! time1.after(time2MinusInterval))
    				{
    					return true;
    				}
    			}
    		}
    		return false;
    	}
    }	
    
    
    /** timeBeforeByAtMost
     * @param time1
     * @param time2
     * @param maxAmountTime1BeforeTime2
     * @param timeUnits
     * @param namedObjects
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static boolean timeBeforeByAtMost(java.util.Date time1, java.util.Date time2, int maxAmountTime1BeforeTime2, int timeUnits, java.util.HashMap namedObjects) 
    {
//    /* 
//    Pre-conditions: 
//    - timeUnits must be in Calendar enumeration times.  Currently does not support "Weeks". 
//    - namedObjects is the global OpenCDS namedObjects.  If it is desired that a "clinical" definition of time is to be used (see below for description), there MUST be a String key of "useClinicalTimeDefinition" and a target Boolean of true.  Otherwise, a "precise" definition of time is used.
//
//    Evaluates whether time1 is before time2 and is within the specified interval. 
//
//    When using the "precise"/default definition, time-of-day is never altered.  Returns true if time1 < time2 and time1 >= time2 - interval.  E.g., if interval is 1 year and time2 is March 15, 2014 at 3pm, time1 must be < March 15, 2014 at 3pm, and time1 must be >= March 15, 2013 at 3pm. 
//
//    When using the "clinical"/conventional definition, hours and smaller units are ignored for the minimum time if the calendar unit is days or greater (note that time1 still must be lower than time2).  E.g., if interval is 1 year and time2 is March 15, 2014 at 3pm, time1 must be < March 15, 2014 at 3pm, and time1 must be >= any time on March 15, 2013. 
//    */
    	boolean useClinicalTimeDefinition = false;
    	if (namedObjects != null)
    	{
    		Boolean useClinicalTimeDefinitionBoolean = null;
    		Object useClinicalTimeDefinitionObject = namedObjects.get("useClinicalTimeDefinition");
    		
    		if (useClinicalTimeDefinitionObject != null)
    		{
    			useClinicalTimeDefinition = true;
    				
    			try
    			{
    				useClinicalTimeDefinitionBoolean = (Boolean) useClinicalTimeDefinitionObject;
    			}
    			catch (Exception e)
    			{
    			}
    			if (useClinicalTimeDefinitionBoolean != null)
    			{
    				useClinicalTimeDefinition = useClinicalTimeDefinitionBoolean.booleanValue();
    			}
    		}

    	}

    	if (useClinicalTimeDefinition)
    	{
    		if ((time1 != null) && (time2 != null))
    		{
    			if (time1.before(time2))
    			{		
    		if(org.opencds.common.utilities.DateUtility.getInstance().timeDifferenceLessThanOrEqualTo(time1, time2, timeUnits, maxAmountTime1BeforeTime2))
    				{
    					return true;
    				}
    			}
    		}
    		return false;
    	}
    	else
    	{
    		if ((time1 != null) && (time2 != null))
    		{
    			if (time1.before(time2))
    			{
    				java.util.Date time2MinusInterval = org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(time2, timeUnits, -1 * maxAmountTime1BeforeTime2);

    				if (! time1.before(time2MinusInterval))
    				{
    					return true;
    				}
    			}
    		}
    		return false;
    	}
    }	
    
    
    /** timeBeforeByMoreThan
     * @param time1
     * @param time2
     * @param minAmountTime1BeforeTime2
     * @param timeUnits
     * @param namedObjects
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static boolean timeBeforeByMoreThan(java.util.Date time1, java.util.Date time2, int minAmountTime1BeforeTime2, int timeUnits, java.util.HashMap namedObjects) 
    {
//    /* 
//    Pre-conditions: 
//    - timeUnits must be in Calendar enumeration times.  Currently does not support "Weeks". 
//    - namedObjects is the global OpenCDS namedObjects.  If it is desired that a "clinical" definition of time is to be used (see below for description), there MUST be a String key of "useClinicalTimeDefinition" and a target Boolean of true.  Otherwise, a "precise" definition of time is used.
//
//    Evaluates whether time1 is before time2 by more than the specified interval. 
//
//    When using the "precise"/default definition, time-of-day is never altered.  Returns true if time1 < time2 - interval.  E.g., if interval is 1 year and time2 is March 15, 2014 at 3pm, time1 must be < March 15, 2014 at 3pm, and time1 must be < March 15, 2013 at 3pm. 
//
//    When using the "clinical"/conventional definition, hours and smaller units are ignored for the minimum time if the calendar unit is days or greater.  E.g., if interval is 1 year and time2 is March 15, 2014 at 3pm, time1 must be < any time on March 15, 2013. 
//    */
    	boolean useClinicalTimeDefinition = false;
    	if (namedObjects != null)
    	{
    		Boolean useClinicalTimeDefinitionBoolean = null;
    		Object useClinicalTimeDefinitionObject = namedObjects.get("useClinicalTimeDefinition");
    		
    		if (useClinicalTimeDefinitionObject != null)
    		{
    			useClinicalTimeDefinition = true;
    				
    			try
    			{
    				useClinicalTimeDefinitionBoolean = (Boolean) useClinicalTimeDefinitionObject;
    			}
    			catch (Exception e)
    			{
    			}
    			if (useClinicalTimeDefinitionBoolean != null)
    			{
    				useClinicalTimeDefinition = useClinicalTimeDefinitionBoolean.booleanValue();
    			}
    		}

    	}

    	if (useClinicalTimeDefinition)
    	{
    		if ((time1 != null) && (time2 != null))
    		{
    			if (time1.before(time2))
    			{		
    				if(! org.opencds.common.utilities.DateUtility.getInstance().timeDifferenceLessThanOrEqualTo(time1, time2, timeUnits, minAmountTime1BeforeTime2))
    				{
    					return true;
    				}
    			}
    		}
    		return false;
    	}
    	else
    	{
    		if ((time1 != null) && (time2 != null))
    		{
    			if (time1.before(time2))
    			{
    				java.util.Date time2MinusInterval = org.opencds.common.utilities.DateUtility.getInstance().getDateAfterAddingTime(time2, timeUnits, -1 * minAmountTime1BeforeTime2);

    				if (time1.before(time2MinusInterval))
    				{
    					return true;
    				}
    			}
    		}
    		return false;
    	}
    }	


    /** timeIntervalsOverlap
     * @param ivlDate1
     * @param ivlDate2
     * @return
     */
    public static boolean timeIntervalsOverlap(IVLDate ivlDate1, IVLDate ivlDate2) 
    {
//    /* 
//    Returns true if the time intervals overlap, false otherwise.  Note that a null low or high will be considered to mean that there is indefinite continutation of the interval in that direction.
//
//    If either ivlDates are null, returns false (no overlap).
//    */
    	if ((ivlDate1 == null) || (ivlDate2 == null))
    	{
    		return false;
    	}
    	
    	Date lowDate1 = ivlDate1.getLow();
    	Date lowDate2 = ivlDate2.getLow();
    	Date highDate1 = ivlDate1.getHigh();
    	Date highDate2 = ivlDate2.getHigh();
    	
    	if((lowDate1 != null) && (highDate1 != null))
    	{
    		if((lowDate2 != null) && (highDate2 != null))
    		{
    			// applicable					applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2
    			if((! lowDate1.after(highDate2)) && (! highDate1.before(lowDate2)))
    			{
    				return true;
    			}
    		}
    		else if((lowDate2 != null) && (highDate2 == null))
    		{
    			// not applicable				applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2			
    			if(! highDate1.before(lowDate2))
    			{
    				return true;
    			}
    		}
    		else // ((lowDate2 == null) && (highDate2 != null))
    		{
    			// applicable					not applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2			
    			if(! lowDate1.after(highDate2))
    			{
    				return true;
    			}
    		}
    	}
    	else if((lowDate1 != null) && (highDate1 == null))
    	{
    		if((lowDate2 != null) && (highDate2 != null))
    		{
    			// applicable					not applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2			
    			if(! lowDate1.after(highDate2))
    			{
    				return true;
    			}			
    		}
    		else if((lowDate2 != null) && (highDate2 == null))
    		{
    			// not applicable				not applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2			
    			return true;
    		}
    		else // ((lowDate2 == null) && (highDate2 != null))
    		{
    			// applicable					not applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2			
    			if(! lowDate1.after(highDate2))
    			{
    				return true;
    			}
    		}
    	}
    	else // ((lowDate1 == null) && (highDate1 != null))
    	{
    		if((lowDate2 != null) && (highDate2 != null))
    		{
    			// not applicable				applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2		
    			if(! highDate1.before(lowDate2))
    			{
    				return true;
    			}			
    		}
    		else if((lowDate2 != null) && (highDate2 == null))
    		{
    			// not applicable				applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2		
    			if(! highDate1.before(lowDate2))
    			{
    				return true;
    			}
    		}
    		else // ((lowDate2 == null) && (highDate2 != null))
    		{
    			// not applicable				not applicable
    			// lowDate1 <= highDate2 and 	highDate1 >= lowDate2		
    			return true;
    		}
    	}
    	return false; 	
    }	


    /** timeIntervalsOverlapIgnoringTimeComponents
     * @param ivlDate1
     * @param ivlDate2
     * @return
     */
    public static boolean timeIntervalsOverlapIgnoringTimeComponents(IVLDate ivlDate1, IVLDate ivlDate2) 
    {
//    /* 
//    Returns true if the time intervals overlap, false otherwise.  Note that a null low or high will be considered to mean that there is indefinite continutation of the interval in that direction.
//
//    Ignores time components (hours, minutes, seconds, milliseconds) of the date intervals for the purposes of the comparison.
//
//    If either ivlDates are null, returns false (no overlap).
//    */
    	if ((ivlDate1 == null) || (ivlDate2 == null))
    	{
    		return false;
    	}
    	
    	Date lowDate1 = ivlDate1.getLow();
    	Date lowDate2 = ivlDate2.getLow();
    	Date highDate1 = ivlDate1.getHigh();
    	Date highDate2 = ivlDate2.getHigh();
    	Date lowDate1NoTimeComponent = null;
    	Date lowDate2NoTimeComponent = null;
    	Date highDate1NoTimeComponent = null;
    	Date highDate2NoTimeComponent = null;

    	if (lowDate1 != null)
    	{
    		lowDate1NoTimeComponent = stripTimeComponent(lowDate1);
    	}
    	if (lowDate2 != null)
    	{
    		lowDate2NoTimeComponent = stripTimeComponent(lowDate2);
    	}
    	if (highDate1 != null)
    	{
    		highDate1NoTimeComponent = stripTimeComponent(highDate1);
    	}
    	if (highDate2 != null)
    	{
    		highDate2NoTimeComponent = stripTimeComponent(highDate2);
    	}

    	IVLDate ivlDateNoTimeComponent1 = new IVLDate();
    	IVLDate ivlDateNoTimeComponent2 = new IVLDate();

    	ivlDateNoTimeComponent1.setLow(lowDate1NoTimeComponent);
    	ivlDateNoTimeComponent1.setHigh(highDate1NoTimeComponent);

    	ivlDateNoTimeComponent2.setLow(lowDate2NoTimeComponent);
    	ivlDateNoTimeComponent2.setHigh(highDate2NoTimeComponent);
    	
    	return timeIntervalsOverlap(ivlDateNoTimeComponent1, ivlDateNoTimeComponent2);
    }
    
    

}



