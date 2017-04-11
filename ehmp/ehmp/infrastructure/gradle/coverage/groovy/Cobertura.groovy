class Cobertura {

    def check(projectName, thresholds, report, defaultBranchrate, defaultLinerate) {
        def failCheck = false
        def needToSave = false
        report.packages.package.classes.class.each { cls ->
            def currentBranchrate = cls.attribute('branch-rate').toDouble()
            def currentLinerate = cls.attribute('line-rate').toDouble()

            def thresholdLinerate = defaultLinerate / 100
            def thresholdBranchrate = defaultBranchrate / 100

            if (thresholds != null) {
                def threshold = thresholds.threshold.find { it.@class == cls.@name }

                if (threshold != null) {
                    def thresholdLineCount = threshold.@linecount.toInteger()
                    def thresholdBranchCount = threshold.@branchcount.toInteger()

                    def (currentLineCount, currentLinesExecuted, currentBranchCount, currentBranchesExecuted) = getLineStatistics(cls.lines.line)

                    if (thresholdLineCount != currentLineCount) {
                        def thresholdLinesExecuted = threshold.@linesexecuted.toInteger()
                        def addedLineCount = currentLineCount - thresholdLineCount

                        if (addedLineCount < 0) {
                            threshold.@linerate = defaultLinerate / 100
                        } else {
                            def newMinimumLineRate = (thresholdLinesExecuted + (addedLineCount * thresholdLinerate)) / currentLineCount
                            if (newMinimumLineRate < currentLinerate) {
                                threshold.@linerate = currentLinerate
                            } else {
                                threshold.@linerate = newMinimumLineRate
                            }
                        }
                        threshold.@linesexecuted = Math.round(threshold.@linerate * currentLineCount)
                        threshold.@linecount = currentLineCount
                        needToSave = true
                    }

                    if (thresholdBranchCount != currentBranchCount) {
                        def thresholdBranchesExecuted = threshold.@branchsexecuted.toInteger()
                        def addedBranchCount = currentBranchCount - thresholdBranchCount

                        if (addedBranchCount < 0) {
                            threshold.@branchrate = defaultBranchrate / 100
                        } else {
                            threshold.@branchrate = (thresholdBranchesExecuted + (addedBranchCount * thresholdBranchrate)) / currentBranchCount
                        }
                        threshold.@branchsexecuted = Math.round(threshold.@branchrate * currentBranchCount)
                        threshold.@branchcount = currentBranchCount
                        needToSave = true
                    }

                    thresholdLinerate = threshold.@linerate.toDouble()
                    thresholdBranchrate = threshold.@branchrate.toDouble()
                }
            }


            if (currentLinerate < thresholdLinerate) {
                System.err.println "Project ${projectName}, Class ${cls.@name} failed check. Line coverage rate of ${Math.round(currentLinerate * 100)}% is below ${Math.round(thresholdLinerate * 100)}%."
                failCheck = true
            }

            if (currentBranchrate < thresholdBranchrate) {
                System.err.println "Project ${projectName}, Class ${cls.@name} failed check. Branch coverage rate of ${Math.round(currentBranchrate * 100)}% is below ${Math.round(thresholdBranchrate * 100)}%."
                failCheck = true
            }
        }
        if (failCheck) {
            throw new RuntimeException("Coverage check failed, please review coverage report.")
        }
        return needToSave
    }

    def writeXml(root, file) {
        def writer = new PrintWriter(file)
        def printer = new XmlNodePrinter(writer, "  ")
        writer.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
        printer.print(root)
        writer.flush()
        writer.close()
    }

    def extractCoverageFailures(coverageReportDir, coverageThresholdBranchrate, coverageThresholdLinerate, handler) {
        // parse it
        def coverage = new XmlParser().parse(new File(coverageReportDir, "coverage.xml"))

        // run through it
        for (pkg in coverage.get("packages")[0].children()) {
            for (cls in pkg.get("classes")[0].children()) {
                def branchrate = cls.attribute('branch-rate').toDouble() * 100
                def linerate = cls.attribute('line-rate').toDouble() * 100

                // if hit a failure, handle it
                if (branchrate < coverageThresholdBranchrate.toDouble() || linerate < coverageThresholdLinerate.toDouble()) {
                    def lines = cls.get("lines")[0].children()

                    def (linecount, linesexecuted, branchcount, branchesexecuted) = getLineStatistics(lines)

                    handler(cls.@name, branchcount, branchesexecuted, cls.attribute('branch-rate').toDouble(),
                            linecount, linesexecuted, cls.attribute('line-rate').toDouble())
                }
            }
        }
    }

    static def getLineStatistics(lines) {
        def linecount = lines.size();
        def linesexecuted = 0
        def branchcount = 0
        def branchesexecuted = 0

        // count lines and branches
        for (line in lines) {
            if (Integer.parseInt(line.@hits) > 0) {
                ++linesexecuted
            }
            if (line.@branch == "true") {
                def cov = line.attribute("condition-coverage")
                def tokens = cov.tokenize("% (/)")
                branchcount += Integer.parseInt(tokens[2])
                branchesexecuted += Integer.parseInt(tokens[1])
            }
        }

        return [linecount, linesexecuted, branchcount, branchesexecuted]
    }

}