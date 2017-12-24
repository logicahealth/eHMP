package vistacore.order.discharge.util;

import java.util.List;
import java.util.Arrays;
import java.lang.Integer;

public class StopCodeUtil implements java.io.Serializable {

    private static final long serialVersionUID = -8818647143395992015L;

    public static boolean isStopCodeTerminal(String primaryStopCodeString, String secondaryStopCodeString) {
        //if passed a string such as "urn:va:stop-code:123", chop it down to just "123"
        if (primaryStopCodeString != null && primaryStopCodeString.contains(":")) {
            primaryStopCodeString = primaryStopCodeString.substring(primaryStopCodeString.lastIndexOf(":") + 1);
        }

        if (secondaryStopCodeString != null && secondaryStopCodeString.contains(":")) {
            secondaryStopCodeString = secondaryStopCodeString.substring(secondaryStopCodeString.lastIndexOf(":") + 1);
        }

        Integer primaryStopCode = null;
        if (primaryStopCodeString != null && primaryStopCodeString.length() > 0) {
            try {
                primaryStopCode = Integer.parseInt(primaryStopCodeString);
            }
            catch (NumberFormatException e) {
                //default to null
            }
        }

        Integer secondaryStopCode = null;
        if (secondaryStopCodeString != null && secondaryStopCodeString.length() > 0) {
            try {
                secondaryStopCode = Integer.parseInt(secondaryStopCodeString);
            }
            catch (NumberFormatException e) {
                //default to null
            }
        }

        return isStopCodeTerminal(primaryStopCode, secondaryStopCode);
    }

	public static boolean isStopCodeTerminal(Integer primaryStopCode, Integer secondaryStopCode) {
		if (checkCaseOne(primaryStopCode, secondaryStopCode)) {
			return true;
		}
		if (checkCaseTwo(secondaryStopCode)) {
			return true;
		}
		if (checkCaseThree(primaryStopCode, secondaryStopCode)) {
			return true;
		}
		if (checkCaseFour(primaryStopCode, secondaryStopCode)) {
			return true;
		}
		if (checkCaseFive(primaryStopCode, secondaryStopCode)) {
			return true;
		}

		return false;
	}


	private static boolean checkCaseOne(Integer primaryStopCode, Integer secondaryStopCode) {

		List<Integer> primaryMatches = Arrays.asList(170, 171, 172, 173, 174, 175, 176, 177, 178, 156, 157, 322, 323, 326, 338, 350, 531, 348, 704, 534, 539);

		List<Integer> secondaryMatches = Arrays.asList(107, 115, 152, 311, 333, 334, 999, 474, 430, 328, 321, 329, 435);

		if (secondaryStopCode != null) {
			if ((primaryMatches.contains(primaryStopCode)) && (!secondaryMatches.contains(secondaryStopCode))) {
				return true;
			}
		}
		else {
			if (primaryMatches.contains(primaryStopCode)) {
				return true;
			}
		}
		return false;
	}

	private static boolean checkCaseTwo(Integer secondaryStopCode) {

		List<Integer> matches = Arrays.asList(179, 322, 323, 350, 531, 348, 704, 534, 539);
		
		if ((secondaryStopCode != null) && matches.contains(secondaryStopCode)) {
			return true;
		}

		return false;
	}

	// This case is never reached, as it is superseded by the logic in case two. It is included here to adhere to the
	// feature requirements only.
	private static boolean checkCaseThree(Integer primaryStopCode, Integer secondaryStopCode) {
		
		if ((primaryStopCode != null) && (primaryStopCode == 224) && (secondaryStopCode != null) && (secondaryStopCode == 323)) {
			return true;
		}

		return false;
	}

	// This case is never reached, as it is superseded by the logic in case one. It is included here to adhere to the
	// feature requirements only.
	private static boolean checkCaseFour(Integer primaryStopCode, Integer secondaryStopCode) {
		
		if ((primaryStopCode != null) && (primaryStopCode == 326) && (secondaryStopCode != null) && (secondaryStopCode == 350)) {
			return true;
		}

		return false;
	}

	// This case is never reached, as it is superseded by the logic in case two. It is included here to adhere to the
	// feature requirements only.
	private static boolean checkCaseFive(Integer primaryStopCode, Integer secondaryStopCode) {
		
		if ((primaryStopCode != null) && (primaryStopCode == 527) && (secondaryStopCode != null) && (secondaryStopCode == 534)) {
			return true;
		}

		return false;
	}

}