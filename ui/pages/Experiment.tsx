import { Box, Select, Input, Grid, Text, VStack, HStack, Spinner, SimpleGrid } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import PageTitle from 'ui/shared/Page/PageTitle';
import ChartWidget from 'ui/shared/chart/ChartWidget';
import useExperiment from '../experiment/useExperiment';

const Experiment = () => {
  const {
    isLoading,
    error,
    startDate,
    endDate,
    chainFilter,
    eventTypeFilter,
    uniqueChains,
    uniqueEventTypes,
    handleStartDateChange,
    handleEndDateChange,
    handleChainFilterChange,
    handleEventTypeFilterChange,
    totalAccumulatedByChain,
    chainChartData,
  } = useExperiment();

  return (
    <>
      {/* Filter Section */}
      <Box mb={6}>
        <HStack spacing={4}>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
          />
          <Select
            value={chainFilter}
            onChange={(e) => handleChainFilterChange(e.target.value)}
          >
            {uniqueChains.map(chain => (
              <option key={chain} value={chain}>{chain}</option>
            ))}
          </Select>
        </HStack>
      </Box>

      {/* Total Deposit Heading */}
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Total Deposit
        </Text>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box textAlign="center" my={4}>
          <Spinner />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box bg="red.100" p={4} borderRadius="md" mb={4}>
          <Text color="red.600">{error.message}</Text>
        </Box>
      )}

      {/* Latest Accumulated Amount by Chain */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {totalAccumulatedByChain.map((stat) => (
          <Box
            key={stat.chainName}
            p={5}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              {stat.chainName}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stat.accumulated_amount.toFixed(2)} OAS
            </Text>
            <Text fontSize="sm" color="gray.500">
              Last Update: {new Date(Number(stat.latestBlockTime) * 1000).toLocaleString()}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Accumulated Amount Chart by Chain */}
      {chainChartData.map((chain) => {
        return (
          <Box key={chain.chainName} mb={6}>
            <ChartWidget
              title={`${chain.chainName} Total Deposit History`}
              description="Daily total deposit"
              items={chain.data.map(item => ({
                date: new Date(item.date),
                value: item.value,
              }))}
              isLoading={isLoading}
              isError={!!error}
              units="OAS"
            />
          </Box>
        );
      })}
    </>
  );
};

export default Experiment;
